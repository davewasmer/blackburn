import assert from 'assert';
import CoreObject from 'core-object';
import forOwn from 'lodash-node/modern/object/forOwn';
import isUndefined from 'lodash-node/modern/lang/isUndefined';

export default CoreObject.extend({

  /**
   * The list of attribute names that should be serialized. Attributes not
   * included in this list will be omitted from the final rendered payload.
   *
   * @type {String[]}
   */
  attributes: [],

  /**
   * An object with configuration on how to serialize relationships.
   * Relationships that have no configuration present are omitted from the final
   * rendered payload.
   *
   * Configuration options include:
   *
   *   * strategy:
   *     * `records`: embed all related records (1-n relationships)
   *     * `record`: embed the related record (1-1 relationships)
   *     * `ids`: include only the ids of related records (1-n relationships)
   *     * `id`: include only the id of the related record (1-1 relationships)
   *   * relationshipLink: a URL template ([RFC 6570](https://tools.ietf.org/html/rfc6570))
   *                       for the relationship itself
   *   * relatedLink: a URL template for the records for this relationship (as
   *                  opposed to the relationship itself)
   *
   * @type {Object}
   */
  relationships: {},

  /**
   * Take a record, and return the attributes that should be rendered. This
   * can be customized in several ways.
   *
   * First, the attributes array on this serializer will act as a whitelist -
   * only those attributes will be serialzed.
   *
   * Second, you can override the way Blackburn serializes keys and values by
   * defining your own .serializeAttributeName() and/or .serializeValue()
   * methods.
   *
   * @method serializeAttributes
   *
   * @param  {Object}            record  a model containing attributes to be
   *                                     serialized
   * @param  {Object}            options
   *
   * @return {Object}                    an object with serialized attributes
   *                                     from the supplied record
   */
  serializeAttributes(record/*, options*/) {
    let serializedAttrs = {};
    this.attributes.forEach((attributeName) => {
      let key = this.serializeAttributeName(attributeName);
      let rawValue = this.adapter.attributeFromRecord(record, attributeName, options);
      if (!isUndefined(rawValue)) {
        let value = this.serializeValue(rawValue, key, record);
        serializedAttrs[key] = value;
      }
    });
  },

  /**
   * Take an attribute name and return the serialized key name.
   *
   * @method serializeAttributeName
   *
   * @param  {String}        attributeName
   *
   * @return {String}                      the key that should be used for this
   *                                       attribute name
   */
  serializeAttributeName(attributeName) {
    return attributeName;
  },

  /**
   * Serialize the given value
   *
   * @method serializeValue
   *
   * @param  {*}            value
   * @param  {String}       key
   * @param  {Object}       record
   *
   * @return {*}             the value that should be rendered
   */
  serializeValue(value/*, key, record */) {
    return value;
  },

  /**
   * Given a record, serialize it's relationships and their related data. The
   * serializer uses the relationships config objec to determine how to
   * serialize any relationships.
   *
   * First, it will only serialize relationships that have config present. So if
   * your model has an "author" relationship, but no "author" key is found on
   * the relationships config object, it won't be present in the final result.
   *
   * Out of the box, several relationship serialization options are supported:
   *
   *   relationships: {
   *     author: {
   *       strategy: 'include',    // or 'id-only'
   *       relationshipLink: '/books/{id}/relationships/author',
   *       relatedLink: '/books/{id}/author'
   *     }
   *   }
   *
   * These options are design to support the out-of-the-box renderers (JSONAPI
   * in particular). However, you can supply your own config here, which will be
   * passed on to your adapter and renderer to allow you to completely customize
   * the entire relationship serialization process.
   *
   * @method serializeRelationships
   *
   * @param  {Object}               record  the record to extract relationships
   *                                        from
   * @param  {Object}               options
   *
   * @return {Object}                              the serialized relationships
   */
  serializeRelationships(record, options) {
    let serializedRelationships = {};
    forOwn(this.relationships, (relationshipConfig, relationshipName) => {
      let key = this.serializeRelationshipName(relationshipName);
      let related = this.adapter.relationshipFromRecord(record, relationshipName, relationshipConfig, options);
      assert(value, `Your serializer supplied config for a "${ relationshipName }" relationship, but your adapter didn't return any information about it.`);
      related.descriptor = relationshipConfig;
      serializedRelationships[key] = this.serializeRelationship(related, key, record);
    });
    return serializedRelationships;
  },

  /**
   * Take a relationship name and return the serialized key for that name.
   *
   * @method serializeRelationshipName
   *
   * @param  {String}                  relationshipName
   *
   * @return {String}
   */
  serializeRelationshipName(relationshipName) {
    return relationshipName;
  },

  /**
   * Take a relationship payload from the adapter and serialize it.
   *
   * @method serializeRelationship
   *
   * @param  {Object}              related
   * @param  {Object}              related.ids  array of related record ids (1-n)
   * @param  {Object}              related.id  the related record's id (1-1)
   * @param  {Object}              related.records  array of related records (1-n)
   * @param  {Object}              related.record  related record (1-1)
   * @param  {Object}              related.descriptor  the user supplied relationship descriptor specified on the serializer
   * @param  {String}              key     the serialized name of the relationship
   * @param  {Object}              record  the parent record containing the relationship
   *
   * @return {Object}                      a description of the relationship which will be passed along to the renderer
   */
  serializeRelationship(related) {
    return related;
  },

  /**
   * Return meta information that should be rendered with a given record.
   *
   * @method metaForRecord
   *
   * @param  {Object}                record
   *
   * @return {Object}
   */
  metaForRecord() {}

});
