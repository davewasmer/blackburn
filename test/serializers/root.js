import expect from 'must';
import RawAdapter from '../../lib/adapters/raw';
import RootSerializer from '../../lib/serializers/root';

let adapter = new RawAdapter();

function createSerializer(options) {
  let Serializer = RootSerializer.extend(options);
  return new Serializer({ adapter });
}

describe('RootSerializer', function() {

  describe('top level', function() {
    before(function() {
      this.serializer = createSerializer({ attributes: [ 'foo' ]});
    });
    it('should render a record with a top level type namespace', function() {
      let record = { id: 1 };
      let type = 'foo';
      let payload = this.serializer.render(record, { type });
      expect(payload.foo).to.be.an.object();
    });
    it('should render multiple records as an array in a top level type namespace', function() {
      let records = [ { id: 1 }, { id: 2 } ];
      let type = 'foo';
      let payload = this.serializer.render(records, { type });
      expect(payload.foo).to.be.an.array();
      expect(payload.foo.length).to.be(2);
    });
  });

});
