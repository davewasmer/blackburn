import assert from 'assert';
import CoreObject from 'core-object';

export default CoreObject.extend({

  init(options = {}) {
    assert(options.adapter, 'You must supply an adapter.');
    assert(options.serializers, 'You must supply serializers.');
  }

});
