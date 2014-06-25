var _          = require('lodash');
var fs         = require('fs');
var path       = require('path');
var Module     = require('module');
var detective  = require('detective');
var builtins   = require('builtins');

exports.lint = function(opts) {

  var dependencies = [];

  opts.requires.forEach(function(req) {
    require(req);
  });

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

  opts.entries.forEach(function(entry) {
    require(path.resolve(entry));
  });

  var pkgDependencies = Object.keys(opts.pkg.dependencies || {});

  return {
    missing: _.difference(dependencies, pkgDependencies),
    extra:   _.difference(pkgDependencies, dependencies)
  };

};
