var path   = require('path');
var should = require('should');
var exec   = require('child_process').exec;

describe('require lint', function() {

  this.slow(500);
  this.timeout(500);

  describe('entry points', function() {

    it('should follow the <main> entry point', function(done) {
      test([
        '--pkg ' + __dirname + '/main/package.json'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.contain('Missing dependencies: lodash');
        done();
      });
    });

    it('should follow <bin> entry points', function(done) {
      test([
        '--pkg ' + __dirname + '/bin/package.json'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.contain('Missing dependencies: lodash, express');
        done();
      });
    });

    it('can specify manual entry points', function(done) {
      test([
        '--pkg ' + __dirname + '/sources/package.json',
        '--src lib.js',
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.contain('Missing dependencies: lodash');
        done();
      });
    });

  });

  describe('dependencies', function() {

    it('should find dependencies recursively', function(done) {
      test([
        '--pkg ' + __dirname + '/recursive/package.json'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.contain('Missing dependencies: lodash, express');
        done();
      });
    });

    it('can ignore specific required dependencies', function(done) {
      test([
        '--pkg ' + __dirname + '/recursive/package.json',
        '--ignore-missing lodash'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.contain('Missing dependencies: express');
        done();
      });
    });

    it('should handle module with special names', function(done) {
      test([
        '--pkg ' + __dirname + '/special/package.json'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.eql(0);
        stderr.should.not.include('restify');
        stderr.should.not.include('big.js');
        done();
      });
    });

    it('should find extraneous dependencies', function(done) {
      test([
        '--pkg ' + __dirname + '/extra/package.json'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.contain('Extraneous dependencies: express');
        done();
      });
    });

    it('can ignore specified extraneous dependencies', function(done) {
      test([
        '--pkg ' + __dirname + '/extra/package.json',
        '--ignore-extra express'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.eql(0);
        stderr.should.not.contain('express');
        done();
      });
    });

  });

  describe('extra requires', function() {

    it('can process coffee-script source', function() {
      test([
        '--pkg ' + __dirname + '/coffee/package.json',
        '--require coffee-script/register'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.contain('Missing dependencies: ms, express');
        done();
      });
    });

  });

  function test(flags, callback) {
    var binary = path.resolve('./bin/cmd.js')
    exec(binary + ' ' + flags.join(' '),  function (error, stdout, stderr) {
      callback(error ? error.code : 0, stdout, stderr);
    });
  }

});
