import path from 'path';
import expect from 'must';
import requireAll from 'require-all';
import RawAdapter from '../../lib/adapters/raw';
import JSONAPIRenderer from '../../lib/renderers/jsonapi';
import mapValues from 'lodash-node/modern/object/mapValues';

describe('JSONAPIRenderer', function() {

  before(function() {
    let adapter = new RawAdapter();
    let serializers = requireAll(path.join(__dirname, '..', 'dummy', 'serializers'));
    serializers = mapValues(serializers, (SerializerClass) => {
      return new SerializerClass();
    });
    this.renderer = new JSONAPIRenderer({ adapter, serializers });
  });

  it('should render a simple record', function() {
    let record = { id: 1, title: 'Human Action' };
    let options = { type: 'books' };
    let payload = this.renderer.render(record, options);

    expect(payload).to.eql({
      data: {
        type: 'books',
        id: 1,
        attributes: {
          title: 'Human Action'
        }
      }
    });
  });

  it('should render simple records as a top level array', function() {
    let records = [
      { id: 1, title: 'Human Action' },
      { id: 2, title: 'I, Pencil' }
    ];
    let options = { type: 'books' };
    let payload = this.renderer.render(records, options);

    expect(payload).to.eql({
      data: [
        {
          type: 'books',
          id: 1,
          attributes: {
            title: 'Human Action'
          }
        },
        {
          type: 'books',
          id: 2,
          attributes: {
            title: 'I, Pencil'
          }
        }
      ]
    });
  });

  it('should render related records as sideloaded objects', function() {
    let record = {
      id: 1,
      title: 'Human Action',
      author_id: 2,
      author: {
        id: 2,
        name: 'Ludwig'
      }
    };
    let options = {
      type: 'books',
      relatedTypes: {
        author: 'users'
      }
    };
    let payload = this.renderer.render(record, options);

    expect(payload).to.eql({
      data: {
        type: 'books',
        id: 1,
        attributes: {
          title: 'Human Action'
        },
        relationships: {
          author: {
            data: {
              type: 'users',
              id: 2
            }
          }
        }
      },
      included: [
        {
          type: 'users',
          id: 2,
          attributes: {
            name: 'Ludwig'
          }
        }
      ]
    });
  });

  it('should render related record ids as related ids', function() {
    let record = {
      id: 1,
      title: 'Human Action',
      category_id: 2
    };
    let options = {
      type: 'books',
      relatedTypes: {
        category: 'categories'
      }
    };
    let payload = this.renderer.render(record, options);

    expect(payload).to.eql({
      data: {
        type: 'books',
        id: 1,
        attributes: {
          title: 'Human Action'
        },
        relationships: {
          category: {
            data: {
              type: 'categories',
              id: 2
            }
          }
        }
      }
    });
  });

});
