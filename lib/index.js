var _          = require('lodash');
var fs         = require('fs');
var path       = require('path');
var Module     = require('module');
var detective  = require('detective');
var builtins   = require('builtins');
var glob       = require('glob');
var util       = require('util');

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
    try {
      var requires = detective(str);
    } catch (ex) {
      ex.toString = function() {
        var message = ex.message.replace(/^Line.*?\:\s/, '');
        return filename + ':' + this.lineNumber + ': ' + message;
      }
      throw ex;
    }
    requires.forEach(function(req) {
      if (req.match(/^\./)) {
        Module._load(req, parent);
      } else {
        var core = builtins.indexOf(req) > -1;
        if (!core) {
          var moduleName = req.match(/[^\/]+/)[0];
          dependencies.push(moduleName);
        }
      }
    });
  }

  // override Module._compile temporarily
  // callback gets executed when the override is ready
  // and the override gets removed when the callback is finished
  override(Module.prototype, '_compile', _compile, function() {
    sources.forEach(function(sourcePath) {
      try {
        require(sourcePath);
      } catch (ex) {
        throw new Error(ex);
      }
    });
  });

  // find all differences
  var pkgDependencies = Object.keys(pkg.dependencies || {});

  return {
    missing: _.difference(dependencies, pkgDependencies, opts.ignoreMissing),
    extra:   _.difference(pkgDependencies, dependencies, opts.ignoreExtra)
  };

};

function allSources(basedir, pkg, additional) {
  return listify(pkg.main)
  .concat(_.values(pkg.bin))
  .concat(getAdditionalSources(basedir, additional))
  .map(function(file){
    return path.resolve(path.join(basedir, file));
  });
}

var getAdditionalSources = function(basedir, additionalSources){
  return listify(additionalSources).reduce(function(acc, pattern) {
    var matches = glob.sync(pattern, {cwd: basedir, nodir:true});
    return acc.concat(matches);
  }, []);
};

var listify = function(obj) {
  if (util.isArray(obj)) return obj;
  if (!obj) return [];
  return [obj];
};

function override(object, method, override, fn) {
  old = object[method];
  try {
    object[method] = override;
    fn();
  } finally {
    object[method] = old;
  }
}
