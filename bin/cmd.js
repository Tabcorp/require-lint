#!/usr/bin/env node

var util     = require('util');
var path     = require('path');
var minimist = require('minimist');
var index    = require('../lib/index');

function files(arg) {
  if (util.isArray(arg)) return arg;
  else if (typeof arg === 'string') return [arg];
  else return [];
}

function print(message, list) {
  if (list.length > 0) {
    console.warn(message, list.join(', '));
  }
}

var args     = minimist(process.argv.slice(2));
var pkg      = require(path.resolve(args.pkg));
var entries  = files(args.entry);
var requires = files(args.require);

if (pkg.main) {
  entries.push(pkg.main);
}

var report = index.lint({
  pkg: pkg,
  requires: requires,
  entries: entries
});

print('Missing dependencies:', report.missing);
print('Extraneous dependencies:', report.extra);

if (report.missing.length > 0) {
  process.exit(1);
}
