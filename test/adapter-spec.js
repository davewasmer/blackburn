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

  describe('attributesForRecord', function() {
    it('should return the attributes for a record', function() {
      let attributes = adapter.attributesForRecord(fixtures.basicModelInstance, fixtures.basicModelInstanceOptions);

      expect(attributes).to.have.keys([ 'title', 'year' ]);
      expect(attributes.title).to.equal('Human Action');
      expect(attributes.year).to.equal(1949);
    });
  });

  describe('relationshipsForRecord', function() {
    it('should return the relationships keyed by their name', function() {
      let relationships = adapter.relationshipsForRecord(fixtures.modelWithRelationships, fixtures.modelWithRelationshipsOptions);

      expect(relationships).to.have.keys([ 'reviews', 'author', 'comments', 'category' ]);
    });
    it('should include the type for each relationship', function() {
      let relationships = adapter.relationshipsForRecord(fixtures.modelWithRelationships, fixtures.modelWithRelationshipsOptions);

      expect(relationships.reviews.type).to.be('reviews');
      expect(relationships.comments.type).to.be('comments');
      expect(relationships.author.type).to.be('users');
      expect(relationships.category.type).to.be('categories');
    });
    it('should include the kind for each relationship', function() {
      let relationships = adapter.relationshipsForRecord(fixtures.modelWithRelationships, fixtures.modelWithRelationshipsOptions);

      expect(relationships.reviews.kind).to.be('hasMany');
      expect(relationships.comments.kind).to.be('hasMany');
      expect(relationships.author.kind).to.be('hasOne');
      expect(relationships.category.kind).to.be('hasOne');
    });
    it('should include the ids for each relationship that has records available', function() {
      let relationships = adapter.relationshipsForRecord(fixtures.modelWithRelatedIds, fixtures.modelWithRelatedIdsOptions);

      expect(relationships.reviews.ids).to.eql([ 1, 2, 3 ]);
      expect(relationships.comments.ids).to.be.undefined();
      expect(relationships.author.id).to.eql(1);
      expect(relationships.category.id).to.be.undefined();
    });
    it('should include the records for each relationship that has records available', function() {
      let relationships = adapter.relationshipsForRecord(fixtures.modelWithRelatedRecords, fixtures.modelWithRelatedRecordsOptions);

      expect(relationships.reviews.records).to.eql([ { id: 1, text: 'one' }, { id: 2, text: 'two' }, { id: 3, text: 'three' } ]);
      expect(relationships.comments.records).to.be.undefined();
      expect(relationships.author.record).to.eql({ id: 1, name: 'one' });
      expect(relationships.category.record).to.be.undefined();
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
