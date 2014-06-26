var _          = require('lodash');
var fs         = require('fs');
var path       = require('path');
var Module     = require('module');
var detective  = require('detective');
var builtins   = require('builtins');

exports.lint = function(opts) {

  // pre-load all "--require" files
  var requires = opts.requires || [];
  requires.forEach(function(req) {
    require(req);
  });

  // load the package.json
  var pkg = require(opts.pkg);
  var basedir = path.dirname(opts.pkg);
  var sources = allSources(basedir, pkg, opts.sources);
  if (sources.length === 0) {
    throw new Error('No entry points found, please specify --src');
  }

  var dependencies = [];

  // override of Module._compile
  // to find all call to "require"
  function _compile(str, filename) {
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
  }

  // override Module._compile temporarily
  override(Module.prototype, '_compile', _compile, function() {
    sources.forEach(require);
  });

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

function override(object, method, override, fn) {
  old = object[method];
  try {
    object[method] = override;
    fn();
  } finally {
    object[method] = old;
  }
}
