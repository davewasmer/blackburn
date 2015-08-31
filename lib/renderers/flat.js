import Renderer from '../renderer';
import isArray from 'lodash-node/modern/lang/isArray';
import assign from 'lodash-node/modern/object/assign';
import mapValues from 'lodash-node/modern/object/mapValues';

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
      return payload.map((record) => {
        this.renderRecord(record, options);
      });
    } else {
      return this.renderRecord(options, payload);
    }
  },

  renderRecord(record, options) {
    let serializer = this.serializerFor(record);
    let id = this.adapter.idForRecord(record, options);
    let attributes = serializer.serializeAttributes(record, options);
    let relationships = serializer.serializeRelationships(record, options);
    relationships = mapValues(relationships, (relationship) => {
      return relationship[relationship.config.strategy];
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
