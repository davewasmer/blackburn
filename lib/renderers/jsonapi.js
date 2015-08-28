import assert from 'assert';
import Renderer from '../renderer';
import isArray from 'lodash-node/modern/lang/isArray';
import isUndefined from 'lodash-node/modern/lang/isUndefined';
import isEmpty from 'lodash-node/modern/lang/isEmpty';
import set from 'lodash-node/modern/object/set';
import mapValues from 'lodash-node/modern/object/mapValues';

function setIfPresent(obj, key, value) {
  if (!isUndefined(value)) {
    set(obj, key, value);
  }
}

export default Renderer.extend({

  /**
   * Take a payload (a model, an array of models, or an Error) and render it as
   * a JSONAPI compliant payload
   *
   * @method render
   *
   * @param  {Object|Array|Error}   payload
   * @param  {Object}               options
   *
   * @return {Object}         the rendered JSONAPI payload
   */
  render(payload, options) {
    let root = this.renderPrimary(payload, options);
    options.root = root;
    if (options.included) {
      assert(isArray(options.included), `Included must be an array, you supplied ${ options.included }`);
      root.included = options.included.map(this.renderRecord.bind(this, options));
    }
    setIfPresent(root, 'meta', this.metaForRoot());
    return root;
  },

  /**
   * Render the primary payload for a JSONAPI document (either a model or array
   * of models).
   *
   * @method renderPrimary
   * @private
   *
   * @param  {Object|Array}   payload
   * @param  {Object}         options
   *
   * @return {Object}              the value of the root `data` property of the
   *                               JSONAPI document
   */
  renderPrimary(payload, options) {
    if (isArray(payload)) {
      if (payload[0] instanceof Error) {
        return { errors: payload.map(this.renderError.bind(this, options)) };
      } else {
        return { data: payload.map(this.renderRecord.bind(this, options)) };
      }
    } else {
      if (payload instanceof Error) {
        return { errors: [ this.renderError(options, payload) ] };
      } else {
        return { data: this.renderRecord(options, payload) };
      }
    }
  },

  /**
   * Render the supplied record as a resource object.
   *
   * @method renderRecord
   * @see {@link http://jsonapi.org/format/#document-resource-objects|JSONAPI spec}
   *
   * @param  {Object}     options
   * @param  {Object}     record
   *
   * @return {Object}             a resource object representing the record
   */
  renderRecord(options, record) {
    let serializedRecord = {
      type: this.typeForRecord(record, options),
      id: this.idForRecord(record, options)
    };

    setIfPresent(serializedRecord, 'attributes', this.attributesForRecord(record, options));
    setIfPresent(serializedRecord, 'relationships', this.relationshipsForRecord(record, options));
    setIfPresent(serializedRecord, 'links', this.linksForRecord(record, options));
    setIfPresent(serializedRecord, 'meta', this.metaForRecord(record, options));

    return serializedRecord;
  },

  typeForRecord(record, options) {
    return this.adapter.typeForRecord(record, options);
  },

  idForRecord(record, options) {
    return this.adapter.idForRecord(record, options);
  },

  attributesForRecord(record, options) {
    return this.serializerFor(record).serializeAttributes(record, adapter, options);
  },

  relationshipsForRecord(record, options) {
    let serializer = this.serializerFor(record);
    let relationships = serializer.serializeRelationships(record, adapter, options);
    relationships = mapValues(relationships, (descriptor, relationshipName) => {
      let serializedRelationship = {};
      if (descriptor.records) {
        descriptor.records.map(this.includeRecord.bind(this, options));
        serializedRelationship.data = descriptor.records.map((relatedRecord) => {
          return {
            id: descriptor.ids || this.idForRecord(relatedRecord, options),
            type: descriptor.type
          };
        });
      } else if (descriptor.record) {
        this.includeRecord(options, descriptor.record);
        serializedRelationship.data = {
          id: descriptor.id || this.idForRecord(descriptor.record, options),
          type: descriptor.type
        };
      } else if (descriptor.ids) {
        serializedRelationship.data = descriptor.ids.map((id) => {
          return { type: descriptor.type, id: id };
        });
      } else if (descriptor.id) {
        serializedRelationship.data = { type: descriptor.type, id: descriptor.id };
      }
      setIfPresent(serializedRelationship, 'links.' + relationshipName, this.linksForRelationship(record, descriptor, options));
      return serializedRelationship;
    });
    if (!isEmpty(relationships)) {
      return relationships;
    }
  },

  linksForRecord(record, options) {
    let type = this.typeForRecord(record, options);
    return this.serializers[type].linksForRecord && this.serializers[type].linksForRecord(record, options);
  },

  linksForRelationship(record, relationship, options) {
    let type = this.typeForRecord(record, options);
    return this.serializers[type].linksForRelationship && this.serializers[type].linksForRelationship(record, relationship, options);
  },

  metaForRecord(record, options) {
    let type = this.typeForRecord(record, options);
    return this.serializers[type].metaForRecord && this.serializers[type].metaForRecord(record, options);
  },

  metaForRoot(/* payload, options */) {},

  renderError(error) {
    return {
      id: error.id,
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
