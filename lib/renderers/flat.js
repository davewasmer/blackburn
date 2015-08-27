import assert from 'assert';
import Renderer from '../renderer';
import isArray from 'lodash-node/modern/lang/isArray';
import assign from 'lodash-node/modern/object/assign';
import mapValues from 'lodash-node/modern/object/mapValues';
import isUndefined from 'lodash-node/modern/lang/isUndefined';

export default Renderer.extend({

  render(payload, options) {
    if (payload instanceof Error) {
      return this.renderError(payload);
    } else {
      return this.renderPrimary(payload, options);
    }
  },

  renderPrimary(payload, options) {
    if (isArray(payload)) {
      return payload.map(this.renderRecord.bind(this, options));
    } else {
      return this.renderRecord(options, payload);
    }
  },

  renderRecord(options, record) {
    let type = this.adapter.typeForRecord(record, options);
    let serializer = this.serializers[type] || this.serializers.application;
    assert(serializer, `Could not find serializer for ${ type } type, and no application serializer was provided.`);
    let id = this.adapter.idForRecord(record, options);
    let attributes = this.adapter.attributesForRecord(record, options);
    let relationships = this.adapter.relationshipsForRecord(record, options);
    relationships = serializer.serializeRelationships(relationships);
    relationships = mapValues(relationships, (relationship, key) => {
      return (isArray(relationship.records) && relationship.records) ||     // records strategy
             (!isUndefined(relationship.record) && relationship.record) ||  // record strategy
             (!isArray(relationship.ids) && relationship.ids) ||            // ids strategy
             (!isUndefined(relationship.id) && relationship.id);            // id strategy
    });
    return assign(
      { id },
      serializer.serializeAttributes(attributes),
      relationships
    );
  },

  renderError(error) {
    return {
      status: error.status || 500,
      code: error.code || 'InternalServerError',
      message: error.message
    };
  }

});
