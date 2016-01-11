import path from 'path';
import assert from 'assert';
import Serializer from '../serializer';
import isArray from 'lodash/lang/isArray';
import isEmpty from 'lodash/lang/isEmpty';
import set from 'lodash/object/set';
import mapValues from 'lodash/object/mapValues';
import mapKeys from 'lodash/object/mapKeys';
import camelCase from 'lodash/string/camelCase';
import kebabCase from 'lodash/string/kebabCase';
import uniq from 'lodash/array/uniq';

function setIfNotEmpty(obj, key, value) {
  if (!isEmpty(value)) {
    set(obj, key, value);
  }
}

/**
 * Renders the payload according to the JSONAPI 1.0 spec, including related
 * resources, included records, and support for meta and links.
 *
 * @title JSONAPISerializer
 */

export default Serializer.extend({

  /**
   * Take a payload (a model, an array of models, or an Error) and render it as
   * a JSONAPI compliant document
   *
   * @method render
   *
   * @param  {Object|Array|Error}   payload
   * @param  {Object}               options
   *
   * @return {Object}         the rendered JSONAPI document
   */
  render(payload, options) {
    let document = {};
    this.renderPrimary(payload, document, options);
    this.renderIncluded(payload, document, options);
    this.renderMeta(payload, document, options);
    this.renderLinks(payload, document, options);
    this.renderVersion(payload, document, options);
    this.dedupeIncluded(document);
    return document;
  },

  /**
   * Render the primary payload for a JSONAPI document (either a model or array
   * of models).
   *
   * @method renderPrimary
   * @see {@link http://jsonapi.org/format/#document-top-level|JSONAPI spec}
   *
   * @param  {Object|Array}   payload    errors or models to render
   * @param  {Object}         document   top level document to render into
   * @param  {Object}         options
   */
  renderPrimary(payload, document, options) {
    if (isArray(payload)) {
      if (payload[0] instanceof Error) {
        document.errors = payload.map((error) => {
          return this.renderError(error, options);
        });
      } else {
        document.data = payload.map((record) => {
          return this.renderRecord(record, document, options);
        });
      }
    } else {
      if (payload instanceof Error) {
        document.errors = [ this.renderError(payload, options) ];
      } else {
        document.data = this.renderRecord(payload, document, options);
      }
    }
  },

  /**
   * Render any included records into the top level of the document
   *
   * @method renderIncluded
   *
   * @param  {Object|Array} payload
   * @param  {Object}       document  top level JSONAPI document
   * @param  {Object}       options
   * @param  {Object}       options.included  array of records to sideload
   */
  renderIncluded(payload, document, options) {
    if (options.included) {
      assert(isArray(options.included), 'included records must be passed in as an array');
      document.included = options.included.map((includedRecord) => {
        return this.renderRecord(includedRecord, options);
      });
    }
  },

  /**
   * Render top level meta object for a document. Default uses meta supplied in
   * options call to res.render().
   *
   * @method renderMeta
   *
   * @param  {Object|Array}   payload
   * @param  {Object}         document  top level JSONAPI document
   * @param  {Object}         options
   * @param  {Object}         options.meta
   */
  renderMeta(payload, document, options) {
    if (options.meta) {
      document.meta = options.meta;
    }
  },

  /**
   * Render top level links object for a document. Defaults to the links
   * supplied in options to res.render().
   *
   * @method renderLinks
   *
   * @param  {Object|Array}   payload
   * @param  {Object}         document  top level JSONAPI document
   * @param  {Object}         options
   * @param  {Object}         options.links
   */
  renderLinks(payload, document, options) {
    if (options.links) {
      document.links = options.links;
    }
  },

  /**
   * Render the version of JSONAPI supported.
   *
   * @method renderVersion
   *
   * @param  {Object|Array}   payload
   * @param  {Object}         document  top level JSONAPI document
   * @param  {Object}         options
   */
  renderVersion(payload, document) {
    document.jsonapi = {
      version: '1.0'
    };
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
  renderRecord(record, document, options = {}) {
    let adapter = options.adapter || this.adapter;
    let serializedRecord = {
      type: adapter.typeForRecord(record, options),
      id: adapter.idForRecord(record, options)
    };
    setIfNotEmpty(serializedRecord, 'attributes', this.attributesForRecord(record, options));
    setIfNotEmpty(serializedRecord, 'relationships', this.relationshipsForRecord(record, document, options));
    setIfNotEmpty(serializedRecord, 'links', this.linksForRecord(record, options));
    setIfNotEmpty(serializedRecord, 'meta', this.metaForRecord(record, options));
    return serializedRecord;
  },

  /**
   * Returns the JSONAPI attributes object representing this record's
   * relationships
   *
   * @method attributesForRecord
   * @see {@link http://jsonapi.org/format/#document-resource-object-attributes|JSONAPI spec}
   *
   * @param  {Object}            record
   * @param  {Object}            options
   *
   * @return {Object}                    the JSONAPI attributes object
   */
  attributesForRecord(record, options) {
    return this.serializeAttributes(record, options);
  },

  /**
   * The JSONAPI spec recommends (but does not require) that property names be
   * dasherized. The default implementation of this serializer therefore does
   * that, but you can override this method to use a different approach.
   *
   * @method serializeAttributeName
   *
   * @param  {name}               name the attribute name to serialize
   *
   * @return {String}                    the attribute name, dasherized
   */
  serializeAttributeName(name) {
    return kebabCase(name);
  },

  /**
   * Returns the JSONAPI relationships object representing this record's
   * relationships
   *
   * @method relationshipsForRecord
   * @see {@link http://jsonapi.org/format/#document-resource-object-relationships|JSONAPI spec
   *
   * @param  {Object}            record
   * @param  {Object}            options
   *
   * @return {Object}                    the JSONAPI relationships object
   */
  relationshipsForRecord(record, document, options) {
    let relationships = this.serializeRelationships(record, options);
    return mapValues(relationships, (descriptor, relationshipName) => {
      let relationship = {};
      setIfNotEmpty(relationship, 'links', this.linksForRelationship(relationshipName, descriptor, record, options));
      setIfNotEmpty(relationship, 'data', this.dataForRelationship(relationshipName, descriptor, record, document, options));
      setIfNotEmpty(relationship, 'meta', this.metaForRelationship(relationshipName, descriptor, record, options));
      return relationship;
    });
  },

  /**
   * Takes a relationship descriptor and the record it's for, and returns any
   * links for that relationship for that record. I.e. '/books/1/author'
   *
   * @method linksForRelationship
   *
   * @param  {String}             name       name of the relationship
   * @param  {Object}             descriptor descriptor for the relationship
   * @param  {Object}             record     parent record containing the
   *                                         relationships
   *
   * @return {Object}                        the links object for the supplied
   *                                         relationship
   */
  linksForRelationship(name, descriptor, record, options) {
    let recordURL = this.linksForRecord(record, options).self;
    return {
      self: path.join(recordURL, 'relationships/' + name),
      related: path.join(recordURL, name)
    };
  },

  /**
   * Takes a relationship descriptor and a record it's for, and returns the
   * data for that relationship. Also sideloads any included records in the
   * top level included namespace.
   *
   * @method dataForRelationship
   *
   * @param  {String}               name       name of the relationship
   * @param  {Object}               descriptor
   * @param  {Object[]|Object|String|Number|String[]|Number[]}    descriptor.data  the related id(s) or record(s)
   * @param  {String|Number}        descriptor.config  the user supplied relationship config
   * @param  {Object}               record     the parent record that holds this
   *                                           relationship
   * @param  {Object}               document   top level JSONAPI document
   * @param  {Object}               options
   *
   * @return {Object[]}                       array of resource identifiers
   */
  dataForRelationship(name, descriptor, record, document, options = {}) {
    let adapter = options.adapter || this.adapter;
    let { strategy, type } = descriptor.config;
    let data = descriptor.data;

    if (strategy === 'ids') {
      return data.map((id) => {
        return { type, id };
      });
    } else if (strategy === 'id') {
      return { type, id: descriptor.data };
    } else if (strategy === 'records') {
      return data.map((relatedRecord) => {
        this.includeRecord(name, relatedRecord, descriptor, document, options);
        return { type, id: adapter.idForRecord(relatedRecord) };
      });
    } else if (strategy === 'record') {
      this.includeRecord(name, data, descriptor, document, options);
      return { type, id: adapter.idForRecord(data) };
    }
  },

  /**
   * Returns any meta for a given relationship and record. No meta included by
   * default.
   *
   * @method metaForRelationship
   *
   * @param  {String}            name       name of the relationship
   * @param  {Object}            descriptor descriptor for the relationship
   * @param  {Object}            record     parent record containing the
   *                                        relationship
   * @param  {Object}            options
   *
   * @return {Object}
   */
  metaForRelationship() {},

  /**
   * Returns links for a particular record, i.e. self: "/books/1"
   *
   * @method linksForRecord
   *
   * @param  {Object}       record  [description]
   * @param  {Object}       options [description]
   *
   * @return {Object}               [description]
   */
  linksForRecord(record, options = {}) {
    let adapter = options.adapter || this.adapter;
    return {
      self: '/' + adapter.typeForRecord(record, options) + '/' + adapter.idForRecord(record, options)
    };
  },

  /**
   * Returns meta for a particular record.
   *
   * @method metaForRecord
   *
   * @param  {Object}      record
   * @param  {Object}      options
   *
   * @return {Object}
   */
  metaForRecord() {},

  /**
   * Sideloads a record into the top level "included" array
   *
   * @method includeRecord
   * @private
   *
   * @param  {Object}      record   the record to sideload
   * @param  {Object}      descriptor
   * @param  {Object}      descriptor.config
   * @param  {Object}      descriptor.config.type
   * @param  {Object}      descriptor.config.strategy
   * @param  {Object}      descriptor.data
   * @param  {Object}      document the top level JSONAPI document
   * @param  {Object}      options
   */
  includeRecord(name, record, descriptor, document, options) {
    if (!isArray(document.included)) {
      document.included = [];
    }
    let relatedOptions = options.relationships && options.relationships[name] || options;
    let relatedSerializer = descriptor.config.serializer || this.serializerFor(record, relatedOptions);
    assert(relatedSerializer, `No serializer found for the ${ name } relationship. You must either supply a serializer as part of the relationship config object, or supply one for the ${ descriptor.config.type } type in the serializers hash.`);
    document.included.push(relatedSerializer.renderRecord(record, document, relatedOptions));
  },

  /**
   * Render the supplied error
   *
   * @method renderError
   *
   * @param  {Error}    error
   *
   * @return {Object}          the JSONAPI error object
   */
  renderError(error) {
    let renderedError = {
      id: error.id,
      status: error.status || 500,
      code: error.code || error.name || 'InternalServerError',
      title: error.title,
      detail: error.message
    };
    setIfNotEmpty(renderedError, 'source', this.sourceForError(error));
    setIfNotEmpty(renderedError, 'meta', this.metaForError(error));
    setIfNotEmpty(renderedError, 'links', this.linksForError(error));
    return renderedError;
  },

  /**
   * Given an error, return a JSON Pointer, a URL query param name, or other
   * info indicating the source of the error.
   *
   * @method sourceForError
   * @see {@link http://jsonapi.org/format/#error-objects|JSONAPI spec}
   *
   * @param  {Error}      error
   *
   * @return {Object}            an error source object, optionally including a
   *                             "pointer" JSON Pointer or "parameter" for the
   *                             query param that caused the error.
   */
  sourceForError(error) {
    return error.source;
  },

  /**
   * Return the meta for a given error object. You could use this for example,
   * to return debug information in development environments.
   *
   * @method metaForError
   *
   * @param  {Error}     error
   *
   * @return {Object}
   */
  metaForError(error) {
    return error.meta;
  },

  /**
   * Return a links object for an error. You could use this to link to a bug
   * tracker report of the error, for example.
   *
   * @method linksForError
   *
   * @param  {Error}      error
   *
   * @return {Object}
   */
  linksForError() {},

  /**
   * Remove duplicate entries from the sideloaded data.
   *
   * @method dedupeIncluded
   * @private
   *
   * @param  {Object}       document  the top level JSONAPI document
   */
  dedupeIncluded(document) {
    if (isArray(document.included)) {
      document.included = uniq(document.included, function(resource) {
        return resource.type + '/' + resource.id;
      });
    }
  },

  /**
   * Unlike the other serializers, the default parse implementation does modify
   * the incoming payload. It converts the default dasherized attribute names
   * into camelCase.
   *
   * The parse method here retains the JSONAPI document structure (i.e. data,
   * included, links, meta, etc), only modifying resource objects in place.
   *
   * @method parse
   *
   * @param  {Object} payload the JSONAPI document to parse
   * @param  {Object} options
   * @param  {Boolean} options.hydrate if true, the serializer will replace all
   * resource objects in the document with "hydrated" (instantiated) ORM models.
   * You adapter must implment `createInstanceFromPayload(type, resource)`.
   * @param  {Adapter} options.adapter the adapter to use when creating ORM
   * instances from the payload (see options.hydrate)
   *
   * @return {[type]}         [description]
   */
  parse(payload, options = {}) {
    let adapter = options.adapter || this.adapter;
    assert(!options.hydrate || adapter, 'You must provide an adapter to `parse()` if you want to hyrdate parsed resources.');
    let parseResource = this.parseResource.bind(this);
    let instantiate;
    if (options.hydrate) {
      instantiate = adapter.createInstanceFromPayload.bind(options.adapter);
    }
    if (payload.data) {
      if (!isArray(payload.data)) {
        payload.data = parseResource(payload.data);
        if (options.hydrate) {
          payload.data = instantiate(payload.data.type, payload.data);
        }
      } else {
        payload.data = payload.data.map(parseResource);
        if (options.hydrate) {
          payload.data = payload.data.map(instantiate);
        }
      }
    }
    if (payload.included) {
      payload.included = payload.included.map(parseResource);
      if (options.hydrate) {
        payload.included = payload.included.map(instantiate);
      }
    }
    return payload;
  },

  /**
   * Parse a single resource object from a JSONAPI document. The resource object
   * could come from the top level `data` payload, or from the sideloaded
   * `included` records.
   *
   * @method parseResource
   *
   * @param  {Object}      resource a JSONAPI resource object
   *
   * @return {Object}               the parsed resource object. Note: do not
   * return an ORM instance from this method - that is handled separately.
   */
  parseResource(resource) {
    resource.id = this.parseId(resource.id);
    resource.type = this.parseType(resource.type);
    if (resource.attributes) {
      resource.attributes = this.parseAttributes(resource.attributes);
    }
    if (resource.relationships) {
      resource.relationships = this.parseRelationships(resource.relationships);
    }
    return resource;
  },

  /**
   * Parse a resource object id
   *
   * @method parseId
   *
   * @param  {String} id
   *
   * @return {*}    the parsed id
   */
  parseId(id) {
    return id;
  },

  /**
   * Parse a resource object's type string
   *
   * @method parseType
   *
   * @param  {String}  type
   *
   * @return {*}       the parsed type
   */
  parseType(type) {
    return type;
  },

  /**
   * Parse a resource object's attributes. By default, this converts from the
   * JSONAPI recommended dasheried keys to camelCase.
   *
   * @method parseAttributes
   *
   * @param  {Object}        attrs
   *
   * @return {*}              the parsed attributes
   */
  parseAttributes(attrs) {
    return mapKeys(attrs, (value, key) => {
      return camelCase(key);
    });
  },

  /**
   * Parse a resource object's relationships. By default, this converts from the
   * JSONAPI recommended dasheried keys to camelCase.
   *
   * @method parseRelationships
   *
   * @param  {Object}           relationships
   *
   * @return {*}                         the parsed relationships
   */
  parseRelationships(relationships) {
    return mapKeys(relationships, (value, key) => {
      return camelCase(key);
    });
  }

});
