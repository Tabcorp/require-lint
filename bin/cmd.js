#!/usr/bin/env node

var util     = require('util');
var path     = require('path');
var minimist = require('minimist');
var index    = require('../lib/index');

function list(arg) {
  if (util.isArray(arg)) return arg;
  else if (typeof arg === 'string') return [arg];
  else return [];
}

var args = minimist(process.argv.slice(2));

var report = index.lint({
  pkg: path.resolve(args.pkg || 'package.json'),
  requires: list(args.require),
  sources: list(args.src)
});

if (report.extra.length > 0) {
  console.warn('[WARN] Extraneous dependencies:', report.extra.join(', '));
}

if (report.missing.length > 0) {
  console.error('[ERROR] Missing dependencies:', report.missing.join(', '));
  process.exit(1);
}
