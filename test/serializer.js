import expect from 'must';
import Serializer from '../lib/serializer';

describe('blackburn.Serializer', function() {
  it('should create singletons', function() {
    let serializerOne = new Serializer();
    let serializerTwo = new Serializer();

    expect(serializerOne).to.be(serializerTwo);
  });

  describe('serializing attributes', function() {

    it('should whitelist attributes', function() {
      let serializer = createSerializer({ attributes: [ 'one' ] });
      let attributes = serializer.serializeAttributes({ one: true, two: true });

      expect(attributes).to.have.keys([ 'one' ]);
    });

    it('should allow for renaming attribute keys', function() {
      let serializer = createSerializer({
        attributes: [ 'one' ],
        keyForAttribute(name) {
          return name + '-test';
        }
      });
      let attributes = serializer.serializeAttributes({ one: true });

      expect(attributes).to.have.keys([ 'one-test' ]);
    });

  });

  describe('serializing relationships', function() {

    const bookRelationships = {
      reviews: {
        kind: 'hasMany',
        type: 'reviews',
        ids: [ 1, 2, 3 ]
      },
      comments: {
        kind: 'hasMany',
        type: 'comments',
        ids: [ 1, 2 ],
        records: [ { id: 1, text: 'one' }, { id: 2, text: 'two' } ],
        link: 'http://example.com/book/1/comments'
      },
      author: {
        kind: 'hasOne',
        type: 'user',
        record: { id: 1, name: 'Ludwig' }
      },
      publisher: {
        kind: 'hasOne',
        type: 'publisher',
        id: 1
      },
      category: {
        kind: 'hasOne',
        type: 'category'
      }
    };

    it('should allow for renaming relationship keys', function() {
      let serializer = createSerializer({
        relationships: {
          reviews: 'ids'
        },
        keyForRelationship(name) {
          return name + '-test';
        }
      });
      let relationships = serializer.serializeRelationships(bookRelationships);

      expect(relationships).to.have.keys([ 'reviews-test' ]);
    });

    it('should whitelist relationships', function() {
      let serializer = createSerializer({});
      let relationships = serializer.serializeRelationships(bookRelationships);

      expect(relationships).to.be.empty();
    });

    it('should support serializing ids of related records', function() {
      let serializer = createSerializer({
        relationships: {
          reviews: 'ids'
        }
      });
      let relationships = serializer.serializeRelationships(bookRelationships);

      expect(relationships.reviews).to.eql({
        kind: 'hasMany',
        type: 'reviews',
        ids: [ 1, 2, 3 ]
      });
    });

    it('should throw if id serialization is specified, but no ids were supplied', function() {
      let serializer = createSerializer({
        relationships: {
          category: 'id'
        }
      });

      expect(function() {
        serializer.serializeRelationships(bookRelationships);
      }).to.throw();
    });

    it('should support serializing entire records of related records', function() {
      let serializer = createSerializer({
        relationships: {
          comments: 'records'
        }
      });
      let relationships = serializer.serializeRelationships(bookRelationships);

      expect(relationships.comments).to.eql({
        kind: 'hasMany',
        type: 'comments',
        records: bookRelationships.comments.records
      });
    });

    it('should throw if record serialization is specified, but no records were supplied', function() {
      let serializer = createSerializer({
        relationships: {
          category: 'record'
        }
      });

      expect(function() {
        serializer.serializeRelationships(bookRelationships);
      }).to.throw();
    });

    it('should support serializing the links', function() {
      let serializer = createSerializer({
        links: [ 'comments' ]
      });
      let relationships = serializer.serializeRelationships(bookRelationships);

      expect(relationships.comments).to.eql({
        kind: 'hasMany',
        type: 'comments',
        link: 'http://example.com/book/1/comments'
      });
    });

    it('should throw if link serialization is specified, but no link was supplied', function() {
      let serializer = createSerializer({
        links: [ 'category' ]
      });

      expect(function() {
        serializer.serializeRelationships(bookRelationships);
      }).to.throw();
    });
  });
});

function createSerializer(classDefinition) {
  let MySerializer = Serializer.extend(classDefinition);
  return new MySerializer();
}
