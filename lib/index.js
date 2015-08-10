import assert from 'assert';
import requireAll from 'require-all';
import BaseAdapter from './adapter';
import BaseSerializer from './serializer';

export default function blackburn(options = {}) {

  // Get the adapter instance, which is responsible for shimming whatever ORM
  // you are using so that the renderer can ask the records the various
  // questions it needs to render a response.
  //
  // You can either supply an instance of the adapter, or the class itself
  // (which will be instantianted).
  assert(options.adapter, 'You must supply an adapter to blackburn, so it can understand how to read your model instances.');
  let adapter;
  // options.adapter is a adapter class
  if (typeof options.adapter === 'function') {
    let AdapterClass = options.adapter;
    adapter = new AdapterClass();
  // options.adapter is an instance
  } else {
    adapter = options.adapter;
  }

  // Serializers are responsible for determining what properties of a model are
  // sent over the wire, and can perform basic transformations, like renaming
  // keys from under_scored to camelCase.
  //
  // You must supply a serializer for each type of model you wish to render. You
  // can either supply a string indicating a folder of serializers to require,
  // or an object whose keys are the model types, and whose values are the
  // serializer instances.
  let serializers;
  options.serializers = options.serializers || 'serializers';
  if (typeof options.serializers === 'string') {
    serializers = requireAll(options.serializers);
  } else {
    serializers = options.serializers;
  }

  // The renderer is responsible for taking the data exposed by the serializer,
  // and rendering it into a certain JSON structure over the wire. Renderers will
  let renderer;
  options.renderer = options.renderer || 'raw';
  if (typeof options.renderer === 'string') {
    options.renderer = require('./renderers/' + options.renderer);
  // options.renderer is a renderer class
  }
  if (typeof options.renderer === 'function') {
    let RendererClass = options.renderer;
    renderer = new RendererClass({  });
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
      res.json(renderer.render(payload, opts, adapter, serializers));
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
