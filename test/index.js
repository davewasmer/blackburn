import { expect } from 'chai';
import blackburn from '../lib';
import Serializer from '../lib/serializer';

function noop() { return this; }

function createRes() {
  return {
    render: noop,
    status: noop,
    json: noop
  };
}

describe('blackburn', function() {
  it('should expose a middleware generating function', function() {
    let middleware = blackburn();
    expect(middleware.length).to.equal(3);
  });

  describe('basic - no options', function() {
    beforeEach(function() {
      this.middleware = blackburn();
      this.res = createRes();
    });

    it('should override res.render', function() {
      this.middleware({}, this.res, noop);
      expect(this.res.render).to.be.a('function');
    });

    it('should use the base serializer by default', function() {
      this.middleware({}, this.res, noop);
      expect(this.res.serializer).to.be.instanceof(Serializer);
    });

    it('should call the serialize method of the serializer when render is called', function() {
      let serializeRan = false;
      this.middleware({}, this.res, noop);
      this.res.serializer.serialize = function() {
        serializeRan = true;
      };
      this.res.render();
      expect(serializeRan).to.equal(true);
    });
  });

  describe('serializers', function() {

    it('should create singletons of serializers and attach those to the request', function() {
      let instanceCount = 0;
      let MySerializer = Serializer.extend({
        init() {
          this._super.apply(this, arguments);
          instanceCount += 1;
        }
      });
      let middleware = blackburn({ serializer: MySerializer });

      let res = createRes();
      middleware({}, res, noop);
      expect(res.serializer).to.be.instanceof(MySerializer);
      res.render();
      expect(instanceCount).to.equal(1);

      res = createRes();
      middleware({}, res, noop);
      res.render();
      expect(instanceCount).to.equal(1);
    });

    describe('base serializer', function() {
      it('should return the same payload for serialize', function() {
        let serializer = new Serializer();
        let payload = { foo: 'bar' };
        let result = serializer.serialize(payload);
        expect(payload).to.deep.equal(result);
      });

      it('should return the same payload for deserialize', function() {
        let serializer = new Serializer();
        let payload = { foo: 'bar' };
        let result = serializer.deserialize(payload);
        expect(payload).to.deep.equal(result);
      });
    });

  });

});
