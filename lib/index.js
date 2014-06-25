var _          = require('lodash');
var fs         = require('fs');
var path       = require('path');
var Module     = require('module');
var detective  = require('detective');
var builtins   = require('builtins');

exports.lint = function(opts) {

  var dependencies = [];

  // pre-load all "--require" files
  var requires = opts.requires || [];
  requires.forEach(function(req) {
    require(req);
  });

  // override Module._compile
  // to intercept any "require" statement
  _compile = Module.prototype._compile;
  Module.prototype._compile = function(str, filename) {
    var parent = this;
    var requires = detective(str)
    requires.forEach(function(req) {
      if (req.match(/\./)) {
        Module._load(req, parent);
      } else {
        var core = builtins.indexOf(req) > -1;
        if (!core) {
          dependencies.push(req);
        }
      }
    });
  };

  // load the package.json
  var pkg = require(opts.pkg);
  var basedir = path.dirname(opts.pkg);
  var sources = allSources(basedir, pkg, opts.sources);

  // require and process all sources
  sources.forEach(require);

  // restore Module._compile
  Module.prototype._compile = _compile;

  // find all differences
  var pkgDependencies = Object.keys(pkg.dependencies || {});

  return {
    missing: _.difference(dependencies, pkgDependencies),
    extra:   _.difference(pkgDependencies, dependencies)
  };

};

function allSources(basedir, pkg, additional) {
  var sources = [];
  if (pkg.main) {
    sources.push(pkg.main);
  }
  if (pkg.bin) {
    sources = sources.concat(_.values(pkg.bin));
  }
  if (additional) {
    sources = sources.concat(additional);
  }
  return sources.map(function(file){
    return path.resolve(path.join(basedir, file));
  });
}
