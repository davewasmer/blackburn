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

export default class Serializer extends CoreObject {

  constructor(options = {}) {
    options.attributes = options.attributes || [];
    super(options);
    let prototype = prototypeOf(this);
    if (!singletons.has(prototype)) {
      singletons.set(prototype, this);
      this.links = mapValues(this.links, (template) => {
        if (typeof template === 'string') {
          let parsed = urlTemplate.parse(template);
          return parsed.expand.bind(parsed);
        }
        return template;
      });
    }
    return singletons.get(prototype);
  }

  serializeAttributes(attrs) {
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

  serializeRelationships(relationshipsPayload) {
    let serializationConfig = this.relationships;
    let serializedRelationships = {};
    forOwn(serializationConfig, (strategy, relationshipName) => {
      let payload = relationshipsPayload[relationshipName];
      if (!payload) {
        return;
      }

      // Sanity check the serialization strategy against the adapter payload
      let isSingular = strategy === 'id' || strategy === 'record';
      let isPlural = strategy === 'ids' || strategy === 'records';
      let isSupportedStrategy = (isSingular && payload.kind === 'hasOne') || (isPlural && payload.kind === 'hasMany');
      let isCorrectSingularPayload = isSingular && !isArray(payload[strategy]) && !isUndefined(payload[strategy]);
      let isCorrectPluralPayload = isPlural && isArray(payload[strategy]);
      let adapterProvidedCorrectPayload = isCorrectSingularPayload || isCorrectPluralPayload;

      assert(isSingular || isPlural, `Unknown serialization strategy for the ${ relationshipName } relationship: ${ strategy }`);
      assert(isSupportedStrategy, `You tried to use a "${ strategy }" strategy to serialize ${ relationshipName }, but that isn't a supported strategy for ${ payload.kind } relationships`);
      assert(adapterProvidedCorrectPayload, `You specified the "${ strategy }" serialization strategy for ${ relationshipName }, but your adapter did not supply an ${ strategy }.`);

      let serialized = {
        type: payload.type,
        kind: payload.kind,
        [ strategy ]: payload[strategy]
      };
      let key = this.keyForRelationship(relationshipName);
      serializedRelationships[key] = serialized;
    });

    if (this.links) {
      this.links.forEach((relationshipName) => {
        let payload = relationshipsPayload[relationshipName];
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
