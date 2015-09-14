import assert from 'assert';
import path from 'path';
import requireAll from 'require-all';
import mapValues from 'lodash-node/modern/object/mapValues';
import isArray from 'lodash-node/modern/lang/isArray';
import Adapter from './adapter';
import RawAdapter from './adapters/raw';
import Serializer from './serializer';
import JSONAPISerializer from './serializers/json-api';
import RootSerializer from './serializers/root';
import FlatSerializer from './serializers/flat';

export {
  Serializer,
  JSONAPISerializer,
  RootSerializer,
  FlatSerializer,
  Adapter,
  RawAdapter
};

/**
 * Create a blackburn middleware function that will patch res.render to use
 * the blackburn serializers and renderers.
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
  let adapter = options.adapter || new RawAdapter();

  // Load serializers
  let serializers;
  options.serializers = options.serializers || './serializers';
  if (typeof options.serializers === 'string') {
    serializers = requireAll(path.join(process.cwd(), options.serializers));
  } else {
    serializers = options.serializers;
  }
  // Ensure they are instantiated
  serializers = mapValues(serializers, (Serializer, name) => {
    return typeof Serializer !== 'function' ? Serializer : new Serializer({
      serializers,
      adapter: options.adapter,
      type: name
    });
  });

  let renderMethodName = options.renderMethodName || 'render';

  return function blackburnMiddleware(req, res, next) {
    res[renderMethodName] = function render(status, payload, opts = {}) {
      // Ensure the status is set
      if (typeof status !== 'number') {
        payload = status;
        status = 200;
      }
      res.status(status);

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
        let type = adapter.typeForRecord(sample);
        serializer = serializers[type] || serializers.application;
      }
      assert(serializer, `Unable to serialize response! You didn't supply a serializer, no serializer found matched the payload's type, and you didn't supply an application serializer as a fallback.`);
      res.json(serializer.render(payload, opts));
    };
    next();
  };
}
