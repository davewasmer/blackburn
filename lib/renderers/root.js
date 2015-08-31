import FlatRenderer from './flat';

export default FlatRenderer.extend({

  renderPrimary(record, options) {
    let flat = this._super.apply(this, arguments);
    let type = this.adapter.typeForRecord(record);
    return { [ type ]: flat };
  }

});
