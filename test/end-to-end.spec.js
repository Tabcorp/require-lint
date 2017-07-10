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
        stderr.should.containEql('Missing dependencies: lodash');
        done();
      });
    });

    it('should follow <bin> entry points', function(done) {
      test([
        '--pkg ' + __dirname + '/bin/package.json'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.containEql('Missing dependencies: lodash, express');
        done();
      });
    });

    it('can specify manual entry points', function(done) {
      test([
        '--pkg ' + __dirname + '/sources/package.json',
        '--src lib.js',
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.containEql('Missing dependencies: lodash');
        done();
      });
    });

    it('can specify manual entry points with globs', function(done) {
      test([
        '--pkg ' + __dirname + '/globs/package.json',
        '--src **/file-at-level*.js' ,
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.containEql('Missing dependencies: restify, lodash');
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
        stderr.should.containEql('Missing dependencies: lodash, express');
        done();
      });
    });

    it('can ignore specific required dependencies', function(done) {
      test([
        '--pkg ' + __dirname + '/recursive/package.json',
        '--ignore-missing lodash'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.containEql('Missing dependencies: express');
        done();
      });
    });

    it('should not duplicate module name in error message', function(done) {
      test([
        '--pkg ' + __dirname + '/duplicate/package.json',
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.not.containEql('Missing dependencies: express, express');
        done();
      });
    });

    it('should handle module with special names', function(done) {
      test([
        '--pkg ' + __dirname + '/special/package.json'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.eql(0);
        stderr.should.not.containEql('restify');
        stderr.should.not.containEql('big.js');
        done();
      });
    });

    it('should find extraneous dependencies', function(done) {
      test([
        '--pkg ' + __dirname + '/extra/package.json'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.containEql('Extraneous dependencies: express');
        done();
      });
    });

  });

  describe('extra requires', function() {

    it('can process coffee-script source', function(done) {
      test([
        '--pkg ' + __dirname + '/coffee/package.json',
        '--require coffee-script/register'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.containEql('Missing dependencies: ms, express');
        done();
      });
    });

  });

  describe('syntax error reporting', function(){

    it('can print JavaScript syntax error locations', function (done) {
      test([
        '--pkg ' + __dirname + '/bad-syntax/package.json',
        '--src ' + 'index.js'
      ], function (exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.containEql('bad-syntax/index.js:4');
        stderr.should.containEql('Unexpected token (4:1)');
        done();
      });
    });

    it('can print CoffeeScript syntax error locations', function (done) {
      test([
        '--pkg ' + __dirname + '/bad-syntax/package.json',
        '--require coffee-script/register',
        '--src ' + 'index.coffee'
      ], function (exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.containEql('bad-syntax/index.coffee:3');
        stderr.should.containEql('unmatched )');
        done();
      });
    });

  });

  describe('scoped modules', function() {

    it('can process module names with a @scope', function(done) {
      test([
        '--pkg ' + __dirname + '/scopes/package.json',
      ], function(exitCode, stdout, stderr) {
        exitCode.should.be.above(0);
        stderr.should.containEql('Missing dependencies: @scope/missing');
        stderr.should.containEql('Extraneous dependencies: @scope/extra');
        done();
      });
    });

  });

  describe('ignoring extraneous dependencies', function() {

    it('can ignore specified extraneous dependencies', function(done) {
      test([
        '--pkg ' + __dirname + '/extra/package.json',
        '--ignore-extra express'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.eql(1);
        stderr.should.not.containEql('express');
        stderr.should.containEql('bootstrap');
        done();
      });
    });

    it('ignores comma separated extraneous packages', function(done) {
      test([
        '--pkg ' + __dirname + '/extra/package.json',
        '--ignore-extra express,bootstrap'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.eql(0);
        stderr.should.not.containEql('express');
        stderr.should.not.containEql('bootstrap');
        done();
      });
    });

    it('ignores extraneous packages repeating the same flag', function(done) {
      test([
        '--pkg ' + __dirname + '/extra/package.json',
        '--ignore-extra express --ignore-extra bootstrap'
      ], function(exitCode, stdout, stderr) {
        exitCode.should.eql(0);
        stderr.should.not.containEql('express');
        stderr.should.not.containEql('bootstrap');
        done();
      });
    });

    it('ignores extraneous packages reading from rc file', function(done) {
      test(__dirname + '/extra-config', [], function(exitCode, stdout, stderr) {
        exitCode.should.eql(0);
        stderr.should.not.containEql('express');
        stderr.should.not.containEql('bootstrap');
        done();
      });
    });
  });

  describe('config file', function() {

    it('can load config from a .requirelintrc file at the root', function(done) {
      test(__dirname + '/rc', [], function(exitCode, stdout, stderr) {
        console.log(stdout, stderr)
        exitCode.should.eql(0);
        stderr.should.eql('');
        stderr.should.eql('');
        done();
      });
    });

  });

  function test(cwd, flags, callback) {
    if (!callback) {
      callback = flags
      flags = cwd
      cwd = null
    }
    var binary = path.resolve('./bin/cmd.js')
    var options = cwd ? {cwd:cwd} : {}
    exec(binary + ' ' + flags.join(' '),  options, function (error, stdout, stderr) {
      callback(error ? error.code : 0, stdout, stderr);
    });
  }

});
