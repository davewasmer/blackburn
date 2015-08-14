import expect from 'must';
import Renderer from '../lib/renderer';

describe('blackburn.Renderer', function() {
  it('should require an adapter and serializers map at construction', function() {
    /*eslint-disable no-unused-vars*/
    expect(function() {
      let renderer = new Renderer();
    }).to.throw(Error);
    expect(function() {
      let renderer = new Renderer({ adapter: {} });
    }).to.throw(Error);
    expect(function() {
      let renderer = new Renderer({ serializers: {} });
    }).to.throw(Error);
    /*eslint-enable no-unused-vars*/
  });

  it('should define an abstract render method', function() {
    let renderer = new Renderer({ adapter: {}, serializers: {} });

    expect(function() {
      renderer.render({}, {});
    }).to.throw();
  });
});
