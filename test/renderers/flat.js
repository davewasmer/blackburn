import path from 'path';
import expect from 'must';
import requireAll from 'require-all';
import RawAdapter from '../../lib/adapters/raw';
import FlatRenderer from '../../lib/renderers/flat';
import mapValues from 'lodash-node/modern/object/mapValues';

describe('FlatRenderer', function() {

  before(function() {
    let adapter = new RawAdapter();
    let serializers = requireAll(path.join(__dirname, '..', 'dummy', 'serializers'));
    serializers = mapValues(serializers, (SerializerClass) => {
      return new SerializerClass();
    });
    this.renderer = new FlatRenderer({ adapter, serializers });
  });

  it('should render a simple record as a top level object', function() {
    let record = { id: 1, title: 'Human Action' };
    let options = { type: 'books' };
    let payload = this.renderer.render(record, options);

    expect(payload).to.eql(record);
  });

  it('should render simple records as a top level array', function() {
    let records = [
      { id: 1, title: 'Human Action' },
      { id: 2, title: 'I, Pencil' }
    ];
    let options = { type: 'books' };
    let payload = this.renderer.render(records, options);

    expect(payload).to.eql(records);
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
      id: 1,
      title: 'Human Action',
      author: {
        id: 2,
        name: 'Ludwig'
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
      id: 1,
      title: 'Human Action',
      category: 2
    });
  });

});
