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

  attributeFromRecord(record, attributeName) {
    return record[attributeName];
  },

  relationshipFromRecord(record, relationshipName, relationshipConfig, options) {
    let extractorMethod = relationshipConfig.strategy + 'ForRelationship';
    let extractedRelationship = this[extractorMethod].apply(this, arguments);
    return {
      [ relationshipConfig.strategy ]: extractedRelationship
    };
  },
  
  idForRelationship(record, relationshipName, relationshipConfig, options) {
    return record[relationshipName + '_id'];
  },

  idsForRelationship(record, relationshipName, relationshipConfig, options) {
    return record[relationshipName + '_ids'];
  },

  recordForRelationship(record, relationshipName, relationshipConfig, options) {
    return record[relationshipName];
  },

  recordsForRelationship(record, relationshipName, relationshipConfig, options) {
    return record[relationshipName];
  }

});
