import assert from 'assert';
import CoreObject from 'core-object';
import forOwn from 'lodash-node/modern/object/forOwn';
import isUndefined from 'lodash-node/modern/lang/isUndefined';
import isArray from 'lodash-node/modern/lang/isArray';
import omit from 'lodash-node/modern/object/omit';

const prototypeOf = Object.getPrototypeOf;

const singletons = new Map();

export default class Serializer extends CoreObject {

  constructor(options) {
    super(options);
    let prototype = prototypeOf(this);
    if (!singletons.has(prototype)) {
      singletons.set(prototype, this);
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
      let adapterPayload = relationshipsPayload[relationshipName];

      // Sanity check the serialization strategy against the adapter payload
      if (strategy === 'id' || strategy === 'record') {
        assert(adapterPayload.kind === 'hasOne', `"${ strategy }" is not a supported strategy for ${ adapterPayload.kind } relationships (${ relationshipName })`);
        assert(!isUndefined(adapterPayload[strategy]), `You specified the "${ strategy }" serialization strategy for ${ relationshipName }, but your adapter did not supply an ${ strategy }.`);
      } else if (strategy === 'ids' || strategy === 'records') {
        assert(adapterPayload.kind === 'hasMany', `"${ strategy }" is not a supported strategy for ${ adapterPayload.kind } relationships (${ relationshipName })`);
        assert(isArray(adapterPayload[strategy]), `You specified the "${ strategy }" serialization strategy for ${ relationshipName }, but your adapter did not supply ${ strategy }.`);
      } else {
        assert(false, `Unknown serialization strategy for the ${ relationshipName } relationship: ${ strategy }`);
      }

      let serialized = {
        type: adapterPayload.type,
        kind: adapterPayload.kind,
        [ strategy ]: adapterPayload[strategy]
      };
      let key = this.keyForRelationship(relationshipName);
      serializedRelationships[key] = serialized;
    });

    if (this.links) {
      this.links.forEach((relationshipName) => {
        let adapterPayload = relationshipsPayload[relationshipName];
        let key = this.keyForRelationship(relationshipName);
        let serialized = serializedRelationships[key] = serializedRelationships[key] || {
          type: adapterPayload.type,
          kind: adapterPayload.kind
        };
        assert(adapterPayload.link && adapterPayload.link.match(/^http/), `You included ${ relationshipName } in links, but your adapter did not supply a link for that relationship.`);
        serialized.link = adapterPayload.link;
      });
    }
    return serializedRelationships;
  }

  keyForRelationship(relationshipName) {
    return relationshipName;
  }

}

Serializer.extend = CoreObject.extend;
