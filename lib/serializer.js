import CoreObject from 'core-object';

export default CoreObject.extend({

  serialize(payload/*, options*/) {
    return payload;
  },

  deserialize(body/*, request */) {
    return body;
  }

});
