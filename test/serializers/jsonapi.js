import expect from 'must';
import RawAdapter from '../../lib/adapters/raw';
import JSONAPISerializer from '../../lib/serializers/jsonapi';

let adapter = new RawAdapter();

function createSerializer(options) {
  let Serializer = JSONAPISerializer.extend(options);
  return new Serializer({ adapter });
}

describe('JSONAPISerializer', function() {

  describe('top level', function() {

    describe('primary data', function() {
      it('should render a single record as an object under the data namespace', function() {
        let serializer = createSerializer();
        let record = { id: 1 };
        let payload = serializer.render(record, { type: 'foo' });
        expect(payload.data).to.be.an.object();
        expect(payload.data.type).to.be('foo');
        expect(payload.data.id).to.be(1);
      });
      it('should render multiple records as an array of objects under the data namespace', function() {
        let serializer = createSerializer();
        let records = [ { id: 1 }, { id: 2 } ];
        let payload = serializer.render(records, { type: 'foo' });
        expect(payload.data).to.be.an.array();
        expect(payload.data[0].type).to.be('foo');
        expect(payload.data[0].id).to.be(1);
      });
    });

  });

  describe('attributes', function() {
    it('should render the whitelisted attributes for a record', function() {
      let serializer = createSerializer({ attributes: [ 'title' ]});
      let record = { id: 1, title: 'Human Action' };
      let payload = serializer.render(record, { type: 'foo' });
      expect(payload.data).to.be.an.object();
      expect(payload.data.attributes).to.be.an.object();
      expect(payload.data.attributes.title).to.be('Human Action');
    });
    it('should not render the non-whitelisted attributes for a record', function() {
      let serializer = createSerializer({ attributes: [ 'title' ]});
      let record = { id: 1, title: 'Human Action', fizz: 'buzz' };
      let payload = serializer.render(record, { type: 'foo' });
      expect(payload.data.attributes.fizz).to.be.undefined();
    });
  });

  describe('relationships', function() {

    it('should render related records as included resources', function() {
      let serializers = {
        books: createSerializer({
          type: 'books',
          attributes: [ 'title' ],
          relationships: {
            author: {
              strategy: 'record',
              type: 'users'
            }
          }
        }),
        users: createSerializer({
          type: 'users',
          attributes: [ 'name' ]
        })
      };
      serializers.books.serializers = serializers;
      serializers.users.serializers = serializers;
      let record = {
        id: 1,
        title: 'Human Action',
        /*eslint-disable camelcase*/
        author_id: 2,
        /*eslint-enable camelcase*/
        author: {
          id: 2,
          name: 'Ludwig'
        }
      };
      let options = {
        type: 'books',
        relationships: {
          author: {
            type: 'users'
          }
        }
      };
      let payload = serializers.books.render(record, options);

      expect(payload).to.eql({
        jsonapi: {
          version: '1.0'
        },
        data: {
          type: 'books',
          id: 1,
          attributes: { title: 'Human Action' },
          links: {
            self: '/books/1'
          },
          relationships: {
            author: {
              data: { type: 'users', id: 2 },
              links: {
                related: '/books/1/author',
                self: '/books/1/relationships/author'
              }
            }
          }
        },
        included: [
          {
            type: 'users',
            id: 2,
            attributes: { name: 'Ludwig' },
            links: {
              self: '/users/2'
            }
          }
        ]
      });
    });
  });

});
