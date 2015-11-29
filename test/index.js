import expect from 'must';
import blackburn from '../lib';
import noop from 'lodash/utility/noop';

before(function() {
  this.cwd = process.cwd();
  process.chdir('./test/dummy');
});

describe('blackburn', function() {
  it('should expose a middleware generating function', function() {
    let middleware = blackburn();

    expect(middleware.length).to.equal(3);
  });

  describe('with default options', function() {

    beforeEach(function() {
      this.middleware = blackburn();
      this.res = { render: noop, status: noop, json: noop };
    });

    it('should override res.render', function() {
      this.middleware({}, this.res, noop);

      expect(this.res.render).to.be.a.function();
    });
  });
});

after(function() {
  process.chdir(this.cwd);
});
