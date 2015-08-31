import assert from 'assert';
import CoreObject from 'core-object';

export default CoreObject.extend({

  init(options = {}) {
    assert(options.serializers, 'You must supply serializers.');
    assert(options.adapter, 'You must supply an adapter.');
    this._super.apply(this, arguments);
  },

  serializerFor(record) {
    let type = this.adapter.typeForRecord(record);
    let serializer = this.serializers[type] || this.serializers.application;
    assert(serializer, `Could not find a serializer for ${ type } type records.`);
    return serializer;
  }

});
