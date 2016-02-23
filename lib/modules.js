var builtins = require('builtins');

exports.isRelative = function(path) {
  return /^\./.test(path);
};

exports.isCore = function(path) {
  return builtins.indexOf(path) > -1;
};

exports.name = function(path) {
  var index = (path[0] === '@') ? 2 : 1;
  return path.split('/').slice(0, index).join('/');
};
