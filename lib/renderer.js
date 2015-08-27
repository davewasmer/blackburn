import assert from 'assert';
import CoreObject from 'core-object';
import mapValues from 'lodash-node/modern/object/mapValues';

export default CoreObject.extend({

  init(options = {}) {
    assert(options.serializers, 'You must supply serializers.');
    assert(options.adapter, 'You must supply an adapter.');
    this._super.apply(this, arguments);
  }

});
