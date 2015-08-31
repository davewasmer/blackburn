import expect from 'must';

export default function(adapter, fixtures) {

  describe('typeForRecord', function() {
    it('should return the type for a model', function() {
      let type = adapter.typeForRecord(fixtures.basicModelInstance, fixtures.basicModelInstanceOptions);

      expect(type).to.be.a.string();
    });
  });

  describe('idForRecord', function() {
    it('should return the id for a model', function() {
      let id = adapter.idForRecord(fixtures.basicModelInstance, fixtures.basicModelInstanceOptions);

      try {
        expect(id).to.be.a.string();
      } catch(e) {
        expect(id).to.be.a.number();
      }
    });
  });

  describe('attributeFromRecord', function() {
    it('should return the attributes for a record', function() {
      let title = adapter.attributeFromRecord(fixtures.basicModelInstance, 'title');

      expect(title).to.equal('Human Action');
    });
  });

  describe('relationshipFromRecord', function() {
    it('should include the type for a relationship', function() {
      let reviews = adapter.relationshipFromRecord(fixtures.modelWithRelationships, 'reviews', { strategy: 'ids' });

      expect(reviews.type).to.be('reviews');
    });
    it('should include the kind for each relationship', function() {
      let relationship = adapter.relationshipFromRecord(fixtures.modelWithRelationships, fixtures.modelWithRelationshipsOptions);

      expect(relationship.reviews.kind).to.be('hasMany');
      expect(relationship.comments.kind).to.be('hasMany');
      expect(relationship.author.kind).to.be('hasOne');
      expect(relationship.category.kind).to.be('hasOne');
    });
    it('should include the ids for each relationship that has records available', function() {
      let relationship = adapter.relationshipFromRecord(fixtures.modelWithRelatedIds, fixtures.modelWithRelatedIdsOptions);

      expect(relationship.reviews.ids).to.eql([ 1, 2, 3 ]);
      expect(relationship.comments.ids).to.be.undefined();
      expect(relationship.author.id).to.eql(1);
      expect(relationship.category.id).to.be.undefined();
    });
    it('should include the records for each relationship that has records available', function() {
      let relationship = adapter.relationshipFromRecord(fixtures.modelWithRelatedRecords, fixtures.modelWithRelatedRecordsOptions);

      expect(relationship.reviews.records).to.eql([ { id: 1, text: 'one' }, { id: 2, text: 'two' }, { id: 3, text: 'three' } ]);
      expect(relationship.comments.records).to.be.undefined();
      expect(relationship.author.record).to.eql({ id: 1, name: 'one' });
      expect(relationship.category.record).to.be.undefined();
    });
  });

  if (adapter.linksForRecord) {
    describe('linksForRecord', function() {
      it('should return an object with link names as keys and link URLs as values', function() {
        let links = adapter.linksForRecord(fixtures.modelWithRelationships, fixtures.modelWithRelationshipsOptions);

        if (links.self) {
          expect(links.self).to.startWith('http');
        }
        expect(links.reviews).to.startWith('http');
        expect(links.comments).to.startWith('http');
        expect(links.author).to.startWith('http');
        expect(links.category).to.startWith('http');
      });
    });
  }

  if (adapter.metaForRecord) {
    describe('metaForRecord', function() {
      it('should return an object with metadata about the record', function() {
        let meta = adapter.metaForRecord(fixtures.modelWithMeta, fixtures.modelWithMetaOptions);

        expect(meta).to.be.an.object();
      });
    });
  }

}
