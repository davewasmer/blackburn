import FlatSerializer from './flat';

export default FlatSerializer.extend({

  renderPrimary(record, options) {
    let flat = this._super.apply(this, arguments);
    let type = this.adapter.typeForRecord(record, options);
    return { [ type ]: flat };
  }

});
