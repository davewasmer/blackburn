import FlatSerializer from './flat';

/**
 * Identical to the FlatSerializer, but wraps the primary data payload in a top
 * level type key (i.e. `res.render(book)` -> `{ "books": <book record> }`)
 *
 * @title RootSerializer
 */

export default FlatSerializer.extend({

  renderPrimary(record, options) {
    let flat = this._super.apply(this, arguments);
    let type = this.adapter.typeForRecord(record, options);
    return { [ type ]: flat };
  }

});
