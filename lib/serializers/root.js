import FlatSerializer from './flat';
import forEach from 'lodash/collection/forEach';
import isArray from 'lodash/lang/isArray';
import assert from 'assert';

/**
 * Identical to the FlatSerializer, but wraps the primary data payload in a top
 * level type key (i.e. `res.render(book)` -> `{ "books": <book record> }`)
 *
 * @title RootSerializer
 */

export default FlatSerializer.extend({

  renderPrimary(record, options = {}) {
    let adapter = options.adapter || this.adapter;
    let flat = this._super.apply(this, arguments);
    let type = adapter.typeForRecord(record, options);
    return { [ type ]: flat };
  },

  /**
   * Takes a serialized payload, and if the `hydrate: true`, returns ORM model
   * instance(s) instead of the plain JSON object.
   *
   * @method parse
   *
   * @param  {Object|Array} payload
   * @param  {Object} options
   * @param  {Boolean} options.hydrate If true, return instances of the ORM
   * model rather than POJOs
   *
   * @return {*}
   */
  parse(payload, options = {}) {
    let adapter = options.adapter || this.adapter;
    assert(!options.hydrate || adapter, 'You must provide an adapter to `parse()` if you want to hyrdate parsed records.');
    if (options.hydrate) {
      forEach(payload, (typePayload, type) => {
        if (isArray(typePayload)) {
          return typePayload.map((recordPayload) => {
            return adapter.createInstanceFromPayload(type, recordPayload);
          });
        } else {
          return adapter.createInstanceFromPayload(type, typePayload);
        }
      });
    } else {
      return payload;
    }
  }

});
