import Adapter from '../adapter';
import { pluralize } from 'inflection';

/**
 * Integrate blackburn with your Mongoose ORM.
 *
 * @title Mongoose Adapter
 */

export default Adapter.extend({

  /**
   * Given a Mongoose Document, return the type.
   *
   * @method typeForRecord
   *
   * @param  {Object}      record  a Mongoose Document
   * @param  {Object}      options
   *
   * @return {String}
   */
  typeForRecord(record) {
    return pluralize(record.constructor.modelName);
  },

  /**
   * Given a Mongoose Document, return it's id.
   *
   * @method idForRecord
   *
   * @param  {Object}    record
   *
   * @return {Number|String}  id of the supplied record
   */
  idForRecord(record) {
    return record.id;
  },

  /**
   * Fetch a simple attribute from the record.
   *
   * @method attributeFromRecord
   *
   * @param  {Object}            record
   * @param  {String}            attributeName
   *
   * @return {*}
   */
  attributeFromRecord(record, attributeName) {
    return record[attributeName];
  },

  /**
   * Given a record, the relationship name, and the relationship config, return
   * the data for a given record, which could be the ids, an id, the records, or
   * a specific record.
   *
   * This method takes advantage of the fact that the Document.populated()
   * method either returns the id(s) of the populated record(s), or undefined.
   *
   * @method relationshipFromRecord
   *
   * @param  {Object}  record
   * @param  {String}  relationshipName
   * @param  {Object}  relationshipConfig
   * @param  {String}  relationshipConfig.strategy  the serialization strategy,
   * either 'ids', 'id', 'records', or 'records'
   * @param  {String}  relationshipConfig.type  the type of the related records
   *
   * @return {Object[]|Object|String|Number|String[]|Number[]}  related data
   */
  relationshipFromRecord(record, relationshipName, relationshipConfig/*, options*/) {
    let strategy = relationshipConfig.strategy;
    if (strategy === 'ids' || strategy === 'id') {
      return record.populated(relationshipName) || record[relationshipName];
    } else {
      return record[relationshipName];
    }
  },

});
