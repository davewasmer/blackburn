import path from 'path';
import requireAll from 'require-all';

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

  let serializers;
  options.serializers = options.serializers || './serializers';
  if (typeof options.serializers === 'string') {
    serializers = requireAll(path.join(process.cwd(), options.serializers));
  } else {
    serializers = options.serializers;
  }

  let adapter;
  options.adapter = options.adapter || 'raw';
  if (typeof options.adapter === 'string') {
    let AdapterClass = require(path.join(__dirname, 'adapters', options.adapter));
    adapter = new AdapterClass();
  // options.adapter is an instance
  } else {
    adapter = options.adapter;
  }

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

// LEFT OFF - trying to figure out the right structure for blackburn here.
//
// We have three areas of concern:
//
// 1. interrogating model instances for information about their type, relationships, etc
// 2. configuring what attributes, relationships, etc, should be serialized over the wire
// 3. rendering model instances into a specific JSON format (i.e. JSONAPI)
//
// So perhaps its:
//
// 1. adapter
// 2. serializer
// 3. renderer
//
// 1 & 3 are application wide singletons (for now)
// 2 is type specific, pulled in from individual classes
//
// But now, after implementing some of this, adapters and serializers seem redundant?
// Could serializers be ORM-specifc, and just expose the interface the renderers need?
//
// Biggest problem is bootstrapping - given a raw payload, how do you tell whose
// serializer handles it? Probably provide a pass-in option to supply a function
// which takes a record instance and returns a serializer name.
//
// So the renderer needs a reference to the lookupSerializer method, and probably
// the serializers too.
//
