import Adapter from '../adapter';

/**
 * The raw adapter is for when you aren't using an ORM framework. It assumes you
 * are working with POJOs rather than model instances.
 *
 * @title Raw Adapter
 */

export default Adapter.extend({

  idAttribute: 'id',

  /**
   * Given a POJO model, return the type from the options supplied.
   *
   * @method typeForRecord
   *
   * @param  {Object}      record  a POJO model instance
   * @param  {Object}      options
   * @param  {String}      options.type
   *
   * @return {String}
   */
  typeForRecord(record, options) {
    return options.type;
  },

  /**
   * Given a POJO model, return the id based on the idAttribute.
   *
   * @method idForRecord
   *
   * @param  {Object}    record
   *
   * @return {Number|String}  id of the supplied record
   */
  idForRecord(record) {
    return record[this.idAttribute];
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
    let extractorMethod = relationshipConfig.strategy + 'ForRelationship';
    return this[extractorMethod].apply(this, arguments);
  },

  idForRelationship(record, relationshipName/*, relationshipConfig, options*/) {
    return record[relationshipName + '_id'];
  },

  idsForRelationship(record, relationshipName/*, relationshipConfig, options*/) {
    return record[relationshipName + '_ids'];
  },

  recordForRelationship(record, relationshipName/*, relationshipConfig, options*/) {
    return record[relationshipName];
  },

  recordsForRelationship(record, relationshipName/*, relationshipConfig, options*/) {
    return record[relationshipName];
  }

});
