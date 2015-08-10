import assert from 'assert';
import uuid from 'node-uuid';
import Serializer from '../serializer';
import isArray from 'lodash-node/modern/lang/isArray';

export default Serializer.extend({

  red(payload, options = {}) {
    assert(payload, 'You must supply a payload to serialize.');
    let result = {};
    this.serializePrimary(payload, result);
    if (options.included) {
      assert(isArray(options.included), `Included must be an array, you supplied ${ options.included }`);
      result.included = options.included.map(this.serializeRecord);
    }
    result.meta = this.metaForRoot();
  },

  serializePrimary(payload, result) {
    if (isArray(payload)) {
      if (payload[0] instanceof Error) {
        result.errors = payload.map(this.serializeError);
      } else {
        result.data = payload.map(this.serializeRecord);
      }
    } else {
      if (payload instanceof Error) {
        result.errors = [ this.serializeError(payload) ];
      } else {
        result.data = this.serializeRecord(payload);
      }
    }
  },

  serializeRecord(record) {
    return {
      type: this.typeForRecord(record),
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

  serializeError(error) {
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
