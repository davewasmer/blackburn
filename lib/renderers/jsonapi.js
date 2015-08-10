import assert from 'assert';
import uuid from 'node-uuid';
import Serializer from '../serializer';
import isArray from 'lodash-node/modern/lang/isArray';

export default Serializer.extend({

  render(payload, options, serializers) {
    let result = this.renderPrimary(payload, options, serializers);
    if (options.included) {
      assert(isArray(options.included), `Included must be an array, you supplied ${ options.included }`);
      result.included = options.included.map(this.renderRecord.bind(this, options, serializers));
    }
    result.meta = this.metaForRoot();
  },

  renderPrimary(payload, options, serializers) {
    if (isArray(payload)) {
      if (payload[0] instanceof Error) {
        return { errors: payload.map(this.renderError.bind(this, options, serializers)) };
      } else {
        return { data: payload.map(this.renderRecord.bind(this, options, serializers)) };
      }
    } else {
      if (payload instanceof Error) {
        return { errors: [ this.renderError(options, serializers, payload) ] };
      } else {
        return { data: this.renderRecord(options, serializers, payload) };
      }
    }
  },

  renderRecord(options, serializers, record) {
    return {
      type: adapter.typeForRecord(record),
      id: this.idForRecord(record),
      attributes: this.attributesForRecord(record),
      relationships: this.relationshipsForRecord(record),
      links: this.linksForRecord(record),
      meta: this.metaForRecord(record)
    };
  },

  typeForRecord(record) {

  },

  idForRecord(record) {

  },

  attributesForRecord(record) {

  },

  relationshipsForRecord(record) {

  },

  linksForRecord(record) {

  },

  metaForRecord(record) {

  },

  metaForRoot(/* payload, options */) {},

  renderError(error) {
    return {
      id: error.id || uuid(),
      status: error.status || 500,
      code: error.code || 'InternalServerError',
      title: error.title,
      detail: error.message,
      field: this.fieldForError(error),
      meta: this.metaForError(error),
      links: {
        url: this.urlForError(error)
      }
    };
  },

  fieldForError(error) {
    if (error.field) {
      return {
        source: {
          pointer: '/data/attributes/' + error.field
        },
        field: error.field
      };
    }
  },

  metaForError(error) {
    if (process.env.NODE_ENV !== 'production' && error.debug) {
      return {
        debug: error.debug
      };
    }
  }

});
