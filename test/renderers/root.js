import path from 'path';
import expect from 'must';
import requireAll from 'require-all';
import RawAdapter from '../../lib/adapters/raw';
import RootRenderer from '../../lib/renderers/root';
import mapValues from 'lodash-node/modern/object/mapValues';

describe('RootRenderer', function() {

  before(function() {
    let adapter = new RawAdapter();
    let serializers = requireAll(path.join(__dirname, '..', 'dummy', 'serializers'));
    serializers = mapValues(serializers, (SerializerClass) => {
      return new SerializerClass();
    });
    this.renderer = new RootRenderer({ adapter, serializers });
  });

  it('should render a simple record as an object under a top level type namespace', function() {
    let record = { id: 1, title: 'Human Action' };
    let options = { type: 'books' };
    let payload = this.renderer.render(record, options);

    expect(payload).to.eql({ books: record });
  });

  it('should render simple records as an array under a top level type namespace', function() {
    let records = [
      { id: 1, title: 'Human Action' },
      { id: 2, title: 'I, Pencil' }
    ];
    let options = { type: 'books' };
    let payload = this.renderer.render(records, options);

    expect(payload).to.eql({ books: records });
  });

  it('should render related records as embedded objects', function() {
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
        author: 'user'
      }
    };
    let payload = this.renderer.render(record, options);

    expect(payload).to.eql({
      books: {
        id: 1,
        title: 'Human Action',
        author: {
          id: 2,
          name: 'Ludwig'
        }
      }
    });
  });

  it('should render related record ids as embedded ids', function() {
    let record = {
      id: 1,
      title: 'Human Action',
      category_id: 2
    };
    let options = {
      type: 'books',
      relatedTypes: {
        category: 'user'
      }
    };
    let payload = this.renderer.render(record, options);

    expect(payload).to.eql({
      books: {
        id: 1,
        title: 'Human Action',
        category: 2
      }
    });
  });

});
