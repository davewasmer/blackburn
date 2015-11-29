import Serializer from '../serializer';
import isArray from 'lodash/lang/isArray';
import assign from 'lodash/object/assign';
import mapValues from 'lodash/object/mapValues';

/**
 * Renders the payload as a flat JSON object or array at the top level. Related
 * records are embedded.
 *
 * @title FlatSerializer
 */

export default Serializer.extend({

  /**
   * Renders the payload, either a primary data payload or an error payload.
   *
   * @method render
   *
   * @param  {Object|Array} payload  a record, array of records, or error
   * @param  {Object} options
   *
   * @return {Object|Array}         the rendered payload
   */
  render(payload, options) {
    if (payload instanceof Error) {
      return this.renderError(payload);
    } else {
      return this.renderPrimary(payload, options);
    }
  },

  /**
   * Renders a primary data payload (a record or array of records).
   *
   * @method renderPrimary
   *
   * @param  {Object|Array}  payload  record or array of records
   * @param  {Object}  options
   *
   * @return {Object|Array}              the rendered primary data
   */
  renderPrimary(payload, options) {
    if (isArray(payload)) {
      return payload.map((record) => {
        this.renderRecord(record, options);
      });
    } else {
      return this.renderRecord(payload, options);
    }
  },

  /**
   * Renders an individual record
   *
   * @method renderRecord
   *
   * @param  {Object}     record
   * @param  {Object}     options
   *
   * @return {Object}             the rendered record
   */
  renderRecord(record, options) {
    let id = options.adapter.idForRecord(record, options);
    let attributes = this.serializeAttributes(record, options);
    let relationships = this.serializeRelationships(record, options);
    relationships = mapValues(relationships, (relationship) => {
      return relationship.data;
    });
    return assign({ id }, attributes, relationships);
  },

  /**
   * Looks up the related record's serializer and serializes it.
   *
   * @method serializeRelationshipValue
   *
   * @param  {Object|Array}  data  The related record(s)
   * @param  {String}  name  The name of the relationship
   * @param  {Object}  record  The parent record
   * @param  {Object}  config  The serializer config for this relationship
   * @param  {Object}  options
   *
   * @return {Object|Array}                     the serialized relationship
   */
  serializeRelationshipValue(data, name, record, config, options) {
    options = options.relationships[name];
    if (config.strategy === 'record') {
      let relatedSerializer = this.serializerFor(data, options);
      return relatedSerializer.renderRecord(data, options);
    } else if (config.strategy === 'records') {
      let relatedSerializer = this.serializerFor(data[0], options);
      return data.map((relatedRecord) => {
        return relatedSerializer.renderRecord(relatedRecord, options);
      });
    } else {
      return data;
    }
  },

  /**
   * Render an error payload
   *
   * @method renderError
   *
   * @param  {Error}    error
   *
   * @return {Object}          the rendered error payload
   */
  renderError(error) {
    return {
      status: error.status || 500,
      code: error.code || 'InternalServerError',
      message: error.message
    };
  }

});
