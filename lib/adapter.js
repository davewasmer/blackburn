import CoreObject from 'core-object';

/**
 * Adapters let the blackburn talk to your models, regardless of what ORM you
 * are using. They are essentially a small shim / translation layer between your
 * ORM and blackburn.
 *
 * @title Adapter
 */

export default CoreObject.extend({

  /**
   * Given a record, return it's id.
   *
   * @method idForRecord
   *
   * @param {Object}  record
   * @param {Object}  options
   *
   * @return {String|Number}    id for the record
   */
  idForRecord() {
    throw new Error('You must implement this method');
  },

  /**
   * Given a record, return it's type.
   *
   * @method typeForRecord
   *
   * @param {Object}  record
   * @param {Object}  options
   *
   * @return {String}      the type of the record
   */
  typeForRecord() {
    throw new Error('You must implement this method');
  },

  /**
   * Given a record and attribute name, return the value of the attribute.
   *
   * @method attributeFromRecord
   *
   * @param {Object}  record  the record to extract the attribute from
   * @param {String}  attributeName
   * @param {Object}  options
   *
   * @return {*}            the value of the attribute
   */
  attributeFromRecord() {
    throw new Error('You must implement this method');
  },

  /**
   * Return the requested relationship from the supplied record. The returned
   * object must contain the `type` of the related records, and optionally can
   * include any of the following:
   *
   *  * records - an array of records to potentially embed in the response
   *  *
   *
   * @method relationshipFromRecord
   *
   * @param {Object}  record  the record to extract the relationship from
   * @param {Object}  relationshipName  the name of the relationship
   * @param {Object}  relationshipConfig  the serialization config for this
   *                                      relationship
   * @param {Object}  relationshipConfig.strategy  the specific strategy for
   *                                               serialization ('include' or
   *                                               'id-only')
   * @param {Object}  options
   *
   * @return {Object}         the relationship descriptor, which should include
   *                          an id, ids, record, or records property based on
   *                          the supplied
   */
  relationshipFromRecord() {
    throw new Error('You must implement this method');
  }

});
