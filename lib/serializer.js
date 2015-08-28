import assert from 'assert';
import CoreObject from 'core-object';
import forOwn from 'lodash-node/modern/object/forOwn';
import isUndefined from 'lodash-node/modern/lang/isUndefined';
import isArray from 'lodash-node/modern/lang/isArray';
import isEmpty from 'lodash-node/modern/lang/isEmpty';
import mapValues from 'lodash-node/modern/object/mapValues';
import urlTemplate from 'url-template';

const prototypeOf = Object.getPrototypeOf;
const singletons = new Map();

export default CoreObject.extends({

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
   *   * strategy - either 'include' (embed the entire related record in the
   *                payload) or 'id-only' (include only the foreign keys)
   *   * relationshipLink: a URL template ([RFC 6570](https://tools.ietf.org/html/rfc6570))
   *                       for the relationship itself
   *   * relatedLink: a URL template for the records for this relationship (as
   *                  opposed to the relationship itself)
   *
   * @type {Object}
   */
  relationships: {},

  /**
   * @method init
   * @private
   */
  init() {
    this._super.apply(this, arguments);
    // Pre-compile any URL templates
    this.links = mapValues(this.links, (template) => {
      if (typeof template === 'string') {
        let parsed = urlTemplate.parse(template);
        return parsed.expand.bind(parsed);
      }
      return template;
    });
  }

  serializeAttributes(record, options) {
    let serializedAttrs = {};
    this.attributes.forEach((attributeName) => {
      if (typeof attrs[attributeName] !== 'undefined') {
        let key = this.keyForAttribute(attributeName);
        serializedAttrs[key] = attrs[attributeName];
      }
    });
    return serializedAttrs;
  }

  keyForAttribute(attributeName) {
    return attributeName;
  }

  serializeRelationships(adapterPayload) {
    return mapValues(this.relationships, (relationshipConfig, relationshipName) => {
      let payload = adapterPayload[relationshipName];
      assert(payload, `Your serializer mentions a "${ relationshipName }" relationship, but your adapter didn't return any information about it.`);

      // Sanity check the serialization strategy against the adapter payload
      // let isSingular = strategy === 'id' || strategy === 'record';
      // let isPlural = strategy === 'ids' || strategy === 'records';
      // let isSupportedStrategy = (isSingular && payload.kind === 'hasOne') || (isPlural && payload.kind === 'hasMany');
      // let isCorrectSingularPayload = isSingular && !isArray(payload[strategy]) && !isUndefined(payload[strategy]);
      // let isCorrectPluralPayload = isPlural && isArray(payload[strategy]);
      // let adapterProvidedCorrectPayload = isCorrectSingularPayload || isCorrectPluralPayload;

      // assert(isSingular || isPlural, `Unknown serialization strategy for the ${ relationshipName } relationship: ${ strategy }`);
      // assert(isSupportedStrategy, `You tried to use a "${ strategy }" strategy to serialize ${ relationshipName }, but that isn't a supported strategy for ${ payload.kind } relationships`);
      // assert(adapterProvidedCorrectPayload, `You specified the "${ strategy }" serialization strategy for ${ relationshipName }, but your adapter did not supply an ${ strategy }.`);

      let serialized = {
        type: payload.type,
        kind: payload.kind,
        options: payload
      };
      let key = this.keyForRelationship(relationshipName);
      serializedRelationships[key] = serialized;
    });

    if (this.links) {
      this.links.forEach((relationshipName) => {
        let payload = adapterPayload[relationshipName];
        let key = this.keyForRelationship(relationshipName);
        let serialized = serializedRelationships[key] = serializedRelationships[key] || {
          type: payload.type,
          kind: payload.kind
        };
        assert(payload.link && payload.link.match(/^http/), `You included ${ relationshipName } in links, but your adapter did not supply a link for that relationship.`);
        serialized.link = payload.link;
      });
    }

    if (!isEmpty(serializedRelationships)) {
      return serializedRelationships;
    }
  }

  keyForRelationship(relationshipName) {
    return relationshipName;
  }

  linksForRecord(record, options) {
    if (this.links) {
      return mapValues(this.links, (template) => {
        return template(record, options);
      });
    }
  }



  metaForRecord() {}

}

Serializer.extend = CoreObject.extend;
