import adapterSpec from '../adapter-spec';
import RawAdapter from '../../lib/adapters/raw';
import noop from 'lodash-node/modern/utility/noop';

describe('RawAdapter', function() {
  adapterSpec(new RawAdapter(), {
    basicModelInstance: {
      id: 'foo',
      title: 'Human Action',
      year: 1949
    },
    basicModelInstanceOptions: { type: 'books' },
    modelWithRelationships: {
      /*eslint-disable camelcase*/
      id: 'foo',
      author_id: 1,
      category_id: 1,
      review_ids: [ 1, 2, 3 ],
      comment_ids: [ 1, 2, 3 ]
      /*eslint-enable camelcase*/
    },
    modelWithRelationshipsOptions: {
      type: 'books',
      relatedTypes: {
        author: 'users'
      }
    },
    modelWithRelatedIds: {
      /*eslint-disable camelcase*/
      id: 'foo',
      author_id: 1,
      category_id: noop(),
      review_ids: [ 1, 2, 3 ],
      comment_ids: noop()
      /*eslint-enable camelcase*/
    },
    modelWithRelatedIdsOptions: {},
    modelWithRelatedRecords: {
      /*eslint-disable camelcase*/
      id: 'foo',
      author_id: 1,
      author: { id: 1, name: 'one' },
      category_id: noop(),
      category: noop(),
      review_ids: [ 1, 2, 3 ],
      reviews: [ { id: 1, text: 'one' }, { id: 2, text: 'two' }, { id: 3, text: 'three' } ],
      comment_ids: noop(),
      comments: noop()
      /*eslint-enable camelcase*/
    },
    modelWithRelatedRecordsOptions: {},
    modelWithMeta: {}
  });
});
