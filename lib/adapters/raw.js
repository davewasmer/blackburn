import Adapter from '../adapter';
import omit from 'lodash-node/modern/object/omit';
import pick from 'lodash-node/modern/object/pick';
import mapValues from 'lodash-node/modern/object/mapValues';
import mapKeys from 'lodash-node/modern/object/mapKeys';
import isArray from 'lodash-node/modern/lang/isArray';
import isUndefined from 'lodash-node/modern/lang/isUndefined';
import { pluralize, singularize } from 'inflection';

export default Adapter.extend({

  idAttribute: 'id',

  typeForRecord(record, options) {
    return options.type;
  },

  idForRecord(record) {
    return record[this.idAttribute];
  },

  attributesForRecord(record) {
    return omit(record, (value, key) => {
      return key === this.idAttribute || key.match(/_id(s)?/);
    });
  },

  relationshipsForRecord(record, options) {
    let relationships = pick(record, (value, key) => {
      return key.match(/_id(s)?/);
    });
    relationships = mapValues(relationships, (data, name) => {
      let [ baseKey, suffix ] = name.match(/(.+)(_ids?)/).slice(1);
      let kind = suffix === '_ids' ? 'hasMany' : 'hasOne';
      let relationshipName = kind === 'hasMany' ? pluralize(baseKey) : singularize(baseKey);
      let type = options.relatedTypes && options.relatedTypes[relationshipName] || pluralize(baseKey);
      let extractedRelationship = { type, kind };
      if (kind === 'hasMany' && isArray(data)) {
        extractedRelationship.ids = data;
        extractedRelationship.records = record[relationshipName];
      } else if (kind === 'hasOne' && !isUndefined(data)) {
        extractedRelationship.id = data;
        extractedRelationship.record = record[relationshipName];
      }
      return extractedRelationship;
    });
    relationships = mapKeys(relationships, (extractedRelationship, key) => {
      let base = key.match(/(.+)_id(s)?/)[1];
      return extractedRelationship.kind === 'hasMany' ? pluralize(base) : singularize(base);
    });
    return relationships;
  }

});
