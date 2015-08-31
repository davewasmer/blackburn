import expect from 'must';
import RawAdapter from '../../lib/adapters/raw';

describe('RawAdapter', function() {
  let adapter = new RawAdapter();

  describe('typeForRecord', function() {
    it('should return the type for a model', function() {
      let type = adapter.typeForRecord({}, { type: 'foo' });
      expect(type).to.be('foo');
    });
  });

  describe('idForRecord', function() {
    it('should return the id for a model', function() {
      let id = adapter.idForRecord({ id: 1 });
      expect(id).to.be(1);
    });
    describe('when a different idAttribute is supplied', function() {
      before(function() {
        this.originalIdAttribute = adapter.idAttribute;
        adapter.idAttribute = '_id';
      });
      after(function() {
        adapter.idAttribute = this.originalIdAttribute;
      });
      it('should return the id for a model', function() {
        let id = adapter.idForRecord({ _id: 1 });
        expect(id).to.be(1);
      });
    });
  });

  describe('attributeFromRecord', function() {
    it('should return the attributes for a record', function() {
      let title = adapter.attributeFromRecord({ title: 'foo' }, 'title');
      expect(title).to.equal('foo');
    });
  });

  /*eslint-disable camelcase*/
  describe('relationshipFromRecord', function() {
    it('should return the ids for a "ids" strategy relationship', function() {
      let relatedIds = [ 1, 2 ];
      let reviews = adapter.relationshipFromRecord({ reviews_ids: relatedIds }, 'reviews', { strategy: 'ids' });
      expect(reviews).to.be(relatedIds);
    });
    it('should return the id for a "id" strategy relationship', function() {
      let relatedId = 1;
      let author = adapter.relationshipFromRecord({ author_id: relatedId }, 'author', { strategy: 'id' });
      expect(author).to.be(relatedId);
    });
    it('should return the records for a "records" strategy relationship', function() {
      let relatedRecords = [ { id: 1 }, { id: 2 } ];
      let reviews = adapter.relationshipFromRecord({ reviews: relatedRecords }, 'reviews', { strategy: 'records' });
      expect(reviews).to.be(relatedRecords);
    });
    it('should return the record for a "record" strategy relationship', function() {
      let relatedRecord = { id: 1 };
      let author = adapter.relationshipFromRecord({ author: relatedRecord }, 'author', { strategy: 'record' });
      expect(author).to.be(relatedRecord);
    });
  });
  /*eslint-enable camelcase*/

});
