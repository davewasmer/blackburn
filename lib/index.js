import path from 'path';
import requireAll from 'require-all';
import mapValues from 'lodash-node/modern/object/mapValues';

/**
 * Create a blackburn middleware function that will patch res.render to use the
 * blackburn serializers and renderers.
 *
 * @method blackburn
 *
 * @param  {Object}  options
 * @param  {String|Renderer} options.renderer - defaults to 'raw', can be
 * either 'raw', 'root', 'jsonapi', or a custom Renderer instance
 * @param  {String|Adapter}  options.adapter - defaults to 'raw', can be any
 * supported adapter name or a custom Adapter instance
 * @param  {String|Object}   options.serializers - either the path to the
 * directory of serializers, or an object whose keys are model types, and whose
 * values are instances of their respective Serializers. Defaults to
 * 'serializers'
 * @param  {String}          options.renderMethodKey - the name of the render
 * method to attach to the response object. Defaults to 'render', which will
 * override the Express default render method.
 *
 * @return {Function}        blackburn middleware function
 */
export default function blackburn(options = {}) {

  let adapter;
  options.adapter = options.adapter || 'raw';
  if (typeof options.adapter === 'string') {
    let AdapterClass = require(path.join(__dirname, 'adapters', options.adapter));
    adapter = new AdapterClass();
  // options.adapter is an instance
  } else {
    adapter = options.adapter;
  }

  let serializers;
  options.serializers = options.serializers || './serializers';
  if (typeof options.serializers === 'string') {
    serializers = requireAll(path.join(process.cwd(), options.serializers));
  } else {
    serializers = options.serializers;
  }
  serializers = mapValues(serializers, (Serializer, name) => {
    return typeof Serializer === 'function' ? new Serializer({ serializers, adapter, type: name }) : Serializer;
  });

  let renderer;
  options.renderer = options.renderer || 'flat';
  if (typeof options.renderer === 'string') {
    let RendererClass = require('./renderers/' + options.renderer);
    renderer = new RendererClass({ adapter, serializers });
  // options.renderer is an instance
  } else {
    renderer = options.renderer;
  }

  let renderMethodKey = options.noConflict || 'render';

  return function blackburnMiddleware(req, res, next) {
    res[renderMethodKey] = function render(status, payload, opts = {}) {
      if (typeof status !== 'number') {
        payload = status;
        status = 200;
      }
      res.status(status);
      res.json(renderer.render(payload, opts));
    };
    next();
  };
}
