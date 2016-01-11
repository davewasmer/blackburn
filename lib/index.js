import assert from 'assert';
import path from 'path';
import Promise from 'bluebird';
import requireAll from 'require-all';
import mapValues from 'lodash/object/mapValues';
import isArray from 'lodash/lang/isArray';
import Adapter from './adapter';
import RawAdapter from './adapters/raw';
import MongooseAdapter from './adapters/mongoose';
import Serializer from './serializer';
import JSONAPISerializer from './serializers/jsonapi';
import RootSerializer from './serializers/root';
import FlatSerializer from './serializers/flat';

export {
  Serializer,
  JSONAPISerializer,
  RootSerializer,
  FlatSerializer,
  Adapter,
  RawAdapter,
  MongooseAdapter
};

/**
 * Create a blackburn middleware function that will override res.render to use
 * the blackburn serializers and renderers. The res.render method takes to
 * arguments:
 *
 * * `payload` - either a record, an array of records, or an Error object. Can
 *   also be a Promise which resolves to any of those.
 * * `options` - any options to pass to the serializer or adapter. Blackburn
 *   doesn't use any of these options out of the box, but this allows you to
 *   pass additional information into any custom adapters or serializers.
 *
 * `res.render()` will return a promise which resolves once the response has
 * been rendered.
 *
 * @example
 *
 * import blackburn, { RawAdapter } from 'blackburn';
 *
 * app.use(blackburn({ adapter: RawAdapter }))
 * app.get('/posts', function(req, res, next) {
 *   res.render(Post.find());
 * });
 *
 * @method blackburn
 *
 * @param  {Object}  options
 * @param  {String|Object}  options.adapter - the adapter to use to interrogate
 * model instances
 * @param  {String|Object}   options.serializers - either the path to the
 * directory of serializers, or an object whose keys are model types, and
 * whose values are instances of their respective Serializers. Defaults to
 * 'serializers'. The "application" serializer will be used when no type
 * specific serializer is found.
 * @param  {String}          options.renderMethodName - the name of the render
 * method to attach to the response object. Defaults to 'render', which will
 * override the Express default render method.
 *
 * @return {Function}        blackburn middleware function
 */
export default function blackburn(options = {}) {
  // Load adapters
  let adapters;
  options.adapters = options.adapters || './adapters';
  if (typeof options.adapters === 'string') {
    adapters = requireAll(path.join(process.cwd(), options.adapters));
  } else {
    adapters = options.adapters;
  }
  // Allow for a single universal adapter (just make it the fallback)
  if (options.adapter) {
    adapters.application = options.adapter;
  }

  // Load serializers
  let serializers;
  options.serializers = options.serializers || './serializers';
  if (typeof options.serializers === 'string') {
    serializers = requireAll(path.join(process.cwd(), options.serializers));
  } else {
    serializers = options.serializers;
  }

  // Ensure they are instantiated
  function instantiate(Klass, type) {
    return typeof Klass !== 'function' ? Klass : new Klass({
      serializers,
      adapters,
      type
    });
  }
  serializers = mapValues(serializers, instantiate);
  adapters = mapValues(adapters, instantiate);

  let renderMethodName = options.renderMethodName || 'render';

  return function blackburnMiddleware(req, res, next) {
    res[renderMethodName] = function render(status, payloadPromise, opts) {

      // Ensure we don't double render
      assert(!res._rendered, `res.${ renderMethodName } called twice! You can only call it once per request.`);
      res._rendered = true;

      // Normalize arguments
      // res.render(payload);
      if (!payloadPromise && status) {
        opts = {};
        payloadPromise = status;
        status = null;
      // res.render(status, payload);
      } else if (typeof status === 'number' && !opts) {
        opts = {};
      // res.render(payload, options);
      } else if (typeof status !== 'number' && !opts) {
        opts = payloadPromise;
        payloadPromise = status;
        status = null;
      }

      return Promise.resolve(payloadPromise)
        .catch((error) => { return error; })
        .then((payload) => {

          // Determine the status code - 500 for errors, supplied (or 200) for
          // anything else
          if (payload instanceof Error) {
            res.status(payload.status || 500);
          } else {
            res.status(status || 200);
          }

          let adapter;
          // Adapter name is supplied
          if (typeof opts.adapter === 'string') {
            adapter = adapters[opts.adapter];
          // Adapter instance is supplied
          } else if (opts.adapter) {
            adapter = opts.adapter;
          // No adapter supplied, fall back to application adapter
          }
          opts.adapter = adapter || adapters.application;
          assert(opts.adapter, `Unable to render response! You didn't supply an adapter and you didn't supply an application adapter as a fallback.`);

          let serializer;
          // Serializer name is supplied
          if (typeof opts.serializer === 'string') {
            serializer = serializers[opts.serializer];
          // Serializer instance is supplied
          } else if (opts.serializer) {
            serializer = opts.serializer;
          // No serializer supplied - check the payload to try inferring
          } else {
            let sample = isArray(payload) ? payload[0] : payload;
            try {
              serializer = serializers[opts.adapter.typeForRecord(sample)];
            } catch (e) {
              serializer = serializers.application;
            }
          }
          serializer = serializer || serializers.application;
          assert(serializer, `Unable to render response! You didn't supply a serializer, no serializer found matched the payload's type, and you didn't supply an application serializer as a fallback.`);

          res.json(serializer.render(payload, opts));

        }).catch((error) => {
          res._rendered = false;
          next(error);
        });
    };
    next();
  };
}
