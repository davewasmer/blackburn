import expect from 'must';
import RawAdapter from '../../lib/adapters/raw';
import FlatSerializer from '../../lib/serializers/flat';

let adapter = new RawAdapter();

function createSerializer(options) {
  let Serializer = FlatSerializer.extend(options);
  return new Serializer({ adapter });
}

describe('FlatSerializer', function() {

  describe('top level', function() {
    before(function() {
      this.serializer = createSerializer({ attributes: [ 'foo' ]});
    });
    it('should render a record as a top level object', function() {
      let record = { id: 1 };
      let payload = this.serializer.render(record);
      expect(payload).to.be.an.object();
    });
    it('should render multiple records as a top level array', function() {
      let records = [ { id: 1 }, { id: 2 } ];
      let payload = this.serializer.render(records);
      expect(payload).to.be.an.array();
      expect(payload.length).to.be(2);
    });
  });

  describe('attributes', function() {
    before(function() {
      this.serializer = createSerializer({
        attributes: [ 'title' ]
      });
    });
    it('should render whitelisted attributes', function() {
      let record = { id: 1, title: 'Human Action' };
      let payload = this.serializer.render(record);
      expect(payload.title).to.be('Human Action');
    });
    it('should not render attributes that are not whitelisted', function() {
      let record = { id: 1, title: 'Human Action', foo: 'bar' };
      let payload = this.serializer.render(record);
      expect(payload.foo).to.be.undefined();
    });
  });

  describe('relationships', function() {

    it('should throw when an "ids" strategy is used but no ids are supplied', function() {
      let serializer = createSerializer({
        relationships: {
          books: { strategy: 'ids' }
        }
      });
      let record = {
        id: 1,
        books: [ { id: 1 }, { id: 2 } ]
      };
      expect(function() {
        serializer.render(record);
      }).to.throw();
    });

    it('should throw when an "id" strategy is used but no id is supplied', function() {
      let serializer = createSerializer({
        relationships: {
          author: { strategy: 'id' }
        }
      });
      let record = {
        id: 1,
        author: { id: 1 }
      };
      expect(function() {
        serializer.render(record);
      }).to.throw();
    });

    /*eslint-disable camelcase*/
    it('should throw when an record strategy is used but no record is supplied', function() {
      let serializer = createSerializer({
        relationships: {
          author: { strategy: 'record' }
        }
      });
      let record = {
        id: 1,
        author_id: 1
      };
      expect(function() {
        serializer.render(record);
      }).to.throw();
    });

    it('should throw when an "records" strategy is used but no records are supplied', function() {
      let serializer = createSerializer({
        relationships: {
          books: { strategy: 'records' }
        }
      });
      let record = {
        id: 1,
        books_ids: [ 1, 2 ]
      };
      expect(function() {
        serializer.render(record);
      }).to.throw();
    });

    it('should render an "ids" strategy as an embedded array of ids when supplied with just ids', function() {
      let serializer = createSerializer({
        relationships: {
          books: { strategy: 'ids' }
        }
      });
      let record = {
        id: 1,
        books_ids: [ 1, 2 ]
      };
      let options = {
        relationships: {
          books: {
            type: 'books'
          }
        }
      };
      let payload = serializer.render(record, options);
      expect(payload.books).to.eql([ 1, 2 ]);
    });

    it('should render an "id" strategy as an embedded id when supplied with just the id', function() {
      let serializer = createSerializer({
        relationships: {
          author: { strategy: 'id' }
        }
      });
      let record = {
        id: 1,
        author_id: 1
      };
      let options = {
        relationships: {
          author: {
            type: 'users'
          }
        }
      };
      let payload = serializer.render(record, options);
      expect(payload.author).to.be(1);
    });
    /*eslint-enable camelcase*/

    it('should render a "records" strategy as an embedded array', function() {
      let serializer = createSerializer({
        relationships: {
          books: { strategy: 'records' }
        },
        serializers: {
          books: createSerializer()
        }
      });
      let record = {
        id: 1,
        books: [ { id: 1 }, { id: 2 } ]
      };
      let options = {
        relationships: {
          books: {
            type: 'books'
          }
        }
      };
      let payload = serializer.render(record, options);
      expect(payload.books).to.eql(record.books);
    });

    it('should render a "record" strategy as an embedded object', function() {
      let serializer = createSerializer({
        relationships: {
          author: { strategy: 'record' }
        },
        serializers: {
          users: createSerializer()
        }
      });
      let record = {
        id: 1,
        author: { id: 1 }
      };
      let options = {
        relationships: {
          author: {
            type: 'users'
          }
        }
      };
      let payload = serializer.render(record, options);
      expect(payload.author).to.eql(record.author);
    });

  });

});
