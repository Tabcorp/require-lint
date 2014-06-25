var should = require('should');
var index  = require('../lib/index');

describe('require lint', function() {

  this.slow(100);

  describe('entry points', function() {

    it('should follow the <main> entry point', function() {
      var report = index.lint({
        pkg: __dirname + '/main/package.json'
      });
      report.should.eql({
        missing: ['lodash'],
        extra: []
      });
    });

    it('should follow <bin> entry points', function() {
      var report = index.lint({
        pkg: __dirname + '/bin/package.json'
      });
      report.should.eql({
        missing: ['lodash', 'express'],
        extra: []
      });
    });

    it('can specify manual entry points', function() {
      var report = index.lint({
        pkg: __dirname + '/sources/package.json',
        sources: ['lib.js']
      });
      report.should.eql({
        missing: ['lodash'],
        extra: []
      });
    });

  });

  describe('dependencies', function() {

    it('should find dependencies recursively', function() {
      var report = index.lint({
        pkg: __dirname + '/recursive/package.json'
      });
      report.should.eql({
        missing: ['lodash', 'express'],
        extra: []
      });
    });

    it('should find extraneous dependencies', function() {
      var report = index.lint({
        pkg: __dirname + '/extra/package.json'
      });
      report.should.eql({
        missing: [],
        extra: ['express']
      });
    });

  });

  describe('extra requires', function() {

    it('can process coffee-script source', function() {
      var report = index.lint({
        pkg: __dirname + '/coffee/package.json',
        requires: ['coffee-script/register']
      });
      report.should.eql({
        missing: ['ms', 'express'],
        extra: []
      });
    });

  });

});
