import assert from 'assert';
import CoreObject from 'core-object';
import forOwn from 'lodash/object/forOwn';
import isUndefined from 'lodash/lang/isUndefined';

/**
 * Serializers allow you to customize what data is returned the response, and
 * apply simple transformations to it. They allow you to decouple what data is
 * sent, with how that data is structured / rendered.
 *
 * @title Serializer
 */

export default CoreObject.extend({

  init() {
    this._super(...arguments);
    if (!this.serializers) {
      this.serializers = {};
    }
  },

  /**
   * Take the supplied payload of record(s) or error(s) and the supplied options
   * and return a rendered a JSON response object.
   *
   * @method render
   * @abstract
   *
   * @param  {Object[]|Error[]|Object|Error} payload
   * @param  {Object} options
   * @param  {Object} options.adapter  the adapter to use when interrogating
   *                                   the payload models
   *
   * @return {Object}         the JSON response object
   */
  render() {
    throw new Error('You must implement the render method!');
  },

  /**
   * Take a serialized JSON document (i.e. an incoming request body), and
   * perform any normalization required.
   *
   * The return value of this method is entirely up to the specific serializer,
   * i.e. some may return the payload unchanged, others may tweak the structure,
   * or some could even return actual ORM model instances.
   *
   * This method is optional - the default implementation returns the payload
   * unchanged.
   *
   * @method parse
   *
   * @param {Object} payload
   * @param {Object} options
   *
   * @return {*}
   */
  parse(payload) {
    return payload;
  },

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
   * Out of the box, two options are supported:
   *
   * **strategy**
   *
   * It has one of four possible values:
   *
   *   * `records`: embed all related records (1-n relationships)
   *   * `record`: embed the related record (1-1 relationships)
   *   * `ids`: include only the ids of related records (1-n relationships)
   *   * `id`: include only the id of the related record (1-1 relationships)
   *
   * What the embedded records or ids look like is up to each serializer to
   * determine.
   *
   * **type**
   *
   * The model type of the related records.
   *
   * Specific serializers may also accept additional options in the relationship
   * configuration to customize their response format.
   *
   * @type {Object}
   */
  relationships: {},

  /**
   * The base Serializer class comes with a few methods defined that take
   * advantage of some basic assumptions. `serializeAttributes` is one of them.
   * You don't actually have to use these methods at all, but most types of
   * serializers will find them helpful.
   *
   * `serializeAttributes` takes a record, and return the attributes that should
   * be rendered. Note that attributes are distinct from relationships. This can
   * serialization customized in several ways:
   *
   *   * The attributes array on the serializer will act as a whitelist - only
   *     those attributes will be serialzed.
   *   * You can override the way keys and values are serialized by defining
   *     your own .serializeAttributeName() and/or .serializeAttributeValue()
   *     methods.
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
  serializeAttributes(record, options = {}) {
    let serializedAttrs = {};
    this.attributes.forEach((attributeName) => {
      let key = this.serializeAttributeName(attributeName);
      let rawValue = (options.adapter || this.adapter).attributeFromRecord(record, attributeName, options);
      if (!isUndefined(rawValue)) {
        let value = this.serializeAttributeValue(rawValue, key, record);
        serializedAttrs[key] = value;
      }
    });
    return serializedAttrs;
  },

  /**
   * Take an attribute name and return the serialized key name. Useful for
   * transforming or renaming attributes in the rendered payload, i.e.
   * transforming snake_case to camelCase keys, or vice versa.
   *
   * The default implementation returns the attribute name unchanged.
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
   * Take an attribute value and return the serialized value. Useful for
   * changing how certain types of values are serialized, i.e. Date objects.
   *
   * The default implementation returns the attribute's value unchanged.
   *
   * @method serializeAttributeValue
   *
   * @param  {*}            value
   * @param  {String}       key
   * @param  {Object}       record
   *
   * @return {*}             the value that should be rendered
   */
  serializeAttributeValue(value/*, key, record */) {
    return value;
  },

  /**
   * The base Serializer class comes with a few methods defined that take
   * advantage of some basic assumptions. `serializeRelationships` is one of
   * them. You don't actually have to use these methods at all, but most types
   * of serializers will find them helpful.
   *
   * `serializeRelationships` takes a record and returns an object whose keys
   * are the relationship names, and values are relationship descriptors
   * containing the following information about the relationship:
   *
   *   * `config` - the config supplied in the relationships object (see
   *     {@link Serializer#relationships})
   *   * `data` - contains any data that the adapter was able to return.
   *
   * It only returns relationships that have relationship config present,
   * similar to how `serializeAttributes()` only returns attributes present in
   * the `Serializer.attributes` whitelist.
   *
   * You can tweak this serialization process by overriding either
   * `.serializeRelationshipName()` or `.serializeRelationshipValue()`.
   *
   * @method serializeRelationships
   *
   * @param  {Object}               record  the record to extract relationships
   *                                        from
   * @param  {Object}               options
   *
   * @return {Object}                              the serialized relationships
   */
  serializeRelationships(record, options = {}) {
    let serializedRelationships = {};
    forOwn(this.relationships, (relationshipConfig, relationshipName) => {
      let key = this.serializeRelationshipName(relationshipName);
      let adapterData = (options.adapter || this.adapter).relationshipFromRecord(record, relationshipName, relationshipConfig, options);
      assert(adapterData, `Your serializer supplied config for a "${ relationshipName }" relationship, but your adapter didn't return any information about it.`);
      let data = this.serializeRelationshipValue(adapterData, relationshipName, record, relationshipConfig, options);
      serializedRelationships[key] = {
        config: relationshipConfig,
        data: data
      };
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
   * @param  {Object[]|Object|String|Number}  data  the ids, id, records, or
   * record supplied by the adapter
   * @param  {String}  key  the serialized name of the relationship
   * @param  {Object}  record  the parent record containing the relationship
   * @param  {Object}  config  the user supplied relationship config specified
   * on the serializer
   * @param  {Object}  options
   *
   * @return {*}
   */
  serializeRelationshipValue(data) {
    return data;
  },

  /**
   * Given a record, return the matching serializer for that record's type.
   *
   * @method serializerFor
   *
   * @param  {Object}      record
   *
   * @return {Object}             the appropriate serializer
   */
  serializerFor(record, options = {}) {
    let type = (options.adapter || this.adapter).typeForRecord(record, options);
    let serializer = this.serializers[type] || this.serializers.application;
    assert(serializer, `Could not find a serializer for ${ type } type records (available serializers: ${ Object.keys(this.serializers) }).`);
    return serializer;
  }

});
