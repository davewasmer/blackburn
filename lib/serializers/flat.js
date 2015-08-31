import Serializer from '../serializer';
import isArray from 'lodash-node/modern/lang/isArray';
import assign from 'lodash-node/modern/object/assign';
import mapValues from 'lodash-node/modern/object/mapValues';

export default Serializer.extend({

  render(payload, options) {
    if (payload instanceof Error) {
      return this.renderError(payload);
    } else {
      return this.renderPrimary(payload, options);
    }
  },

  renderPrimary(payload, options) {
    if (isArray(payload)) {
      return payload.map((record) => {
        this.renderRecord(record, options);
      });
    } else {
      return this.renderRecord(payload, options);
    }
  },

  renderRecord(record, options) {
    let id = this.adapter.idForRecord(record, options);
    let attributes = this.serializeAttributes(record, options);
    let relationships = this.serializeRelationships(record, options);
    relationships = mapValues(relationships, (relationship) => {
      return relationship.data;
    });
    return assign({ id }, attributes, relationships);
  },

  // For embedded records, lookup the appropriate serializer for the
  // relationship.
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

  renderError(error) {
    return {
      status: error.status || 500,
      code: error.code || 'InternalServerError',
      message: error.message
    };
  }

});
