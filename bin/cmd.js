#!/usr/bin/env node

var _        = require('lodash');
var util     = require('util');
var path     = require('path');
var minimist = require('minimist');
var index    = require('../lib/index');

function list(arg) {
  if (util.isArray(arg)) return arg;
  else if (typeof arg === 'string') return [arg];
  else return [];
}

var args     = minimist(process.argv.slice(2));
var pkg      = require(path.resolve(args.pkg || 'package.json'));
var sources  = list(args.src);
var requires = list(args.require);

if (pkg.main) {
  sources.push(pkg.main);
}

if (pkg.bin) {
  sources = sources.concat(_.values(pkg.bin));
}

var report = index.lint({
  pkg: pkg,
  requires: requires,
  sources: sources
});

if (report.extra.length > 0) {
  console.warn('[WARN] Extraneous dependencies:', report.extra.join(', '));
}

if (report.missing.length > 0) {
  console.error('[ERROR] Missing dependencies:', report.missing.join(', '));
  process.exit(1);
}
