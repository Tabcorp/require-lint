var should  = require('should');
var modules = require('../lib/modules.js');

describe('modules', function() {

  it('recognises relative modules', function() {
    modules.isRelative('./foo').should.eql(true);
    modules.isRelative('./foo.js').should.eql(true);
  });

  it('recognises node_modules', function() {
    modules.isRelative('foo').should.eql(false);
    modules.isRelative('foo.js').should.eql(false);
  });

  it('recognises core modules', function() {
    modules.isCore('fs').should.eql(true);
    modules.isCore('foobar').should.eql(false);
  });

  it('gets the module name', function() {
    modules.name('foo').should.eql('foo');
  });

  it('gets the module name even with a subfolder', function() {
    modules.name('foo/bar').should.eql('foo');
  });

  it('gets scoped module names', function() {
    modules.name('@scope/foo').should.eql('@scope/foo');
  });

  it('gets scoped module names even with a subfolder', function() {
    modules.name('@scope/foo/bar').should.eql('@scope/foo');
  });

});
