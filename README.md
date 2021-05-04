# require-lint


[![NPM](http://img.shields.io/npm/v/require-lint.svg?style=flat)](https://npmjs.org/package/require-lint)
[![License](http://img.shields.io/npm/l/require-lint.svg?style=flat)](https://github.com/Tabcorp/require-lint)

[![Build Status](http://img.shields.io/travis/Tabcorp/require-lint.svg?style=flat)](http://travis-ci.org/Tabcorp/require-lint)
[![Dependencies](http://img.shields.io/david/Tabcorp/require-lint.svg?style=flat)](https://david-dm.org/Tabcorp/require-lint)
[![Dev dependencies](http://img.shields.io/david/dev/Tabcorp/require-lint.svg?style=flat)](https://david-dm.org/Tabcorp/require-lint)

Parses your code for `require` statements, and checks that:

- all required dependencies are mentioned in `package.json`
- all dependencies in `package.json` are still being used

```
$ npm install -g require-lint
$ require-lint

[require-lint] Missing dependencies: attempt, express
[require-lint] Extraneous dependencies: lodash
```

Any failed checks will trigger an exit code of `1`, and you can choose to fail your build chain.

*Note: require-lint doesn't check dev dependencies, since test code doesn't typically have a single entry point*

## Default behaviour

By default, it looks for a `package.json` in the current folder.

```
$ require-lint
```

It then parses your source from the entry points declared as `main` and `bin`:

```json
{
  "main": "./lib/index.js",
  "bin": {
    "foo": "./bin/foo.js",
    "bar": "./bin/bar.js"
  }
}
```

## Options

You can also specify the following options

- `--pkg`

The path to your `package.json`.

```
$ require-lint --pkg ~/dev/thing/package.json
```

- `--src`

The path to additional entry points.
These must be relative to the given `package.json`.
Globs can be used as paths.

```
$ require-lint --src lib/server.js --src lib/worker.js
```

- `--require`

Any file to be required before processing, for example to load extra compilers like [Coffee-Script](http://coffeescript.org/).
These must be absolute paths or available modules.

```
$ require-lint --require coffee-script/register
```

- `--ignore-missing`

Modules that should not be considered missing, even if they are not declared in `package.json`. This is not recommended!

```
$ require-lint --ignore-missing newrelic
```

- `--ignore-extra`

Modules that should not be considered extraneous, even if they are not `required`. For example you might have a dependency on `coffee-script`, but not explicitely `require` it.

```
$ require-lint --ignore-extra coffee-script
```

If you would like to use `--ignore-extra` with multiple dependencies, you can separate them using commas:

```bash
$ require-lint --ignore-extra coffee-script,bootstrap,ejs
```

## Static configuration

All options above can also be saved in a `.requirelintrc` file at the root of your project. For example:

```
require=coffee-script/register
ignore-missing=newrelic
```

This makes it easier to check-in your configuration to source-control, although you could equally save your options in `package.json`, for example:

```json
{
  "scripts": {
    "lint": "require-lint --require=coffee-script/register"
  }
}
```

Note that the `.requirelintrc` file can be located at any path supported by the [rc](https://www.npmjs.com/package/rc) package, such as `~/.requirelintrc` or `/etc/requirelintrc`.

## Dev notes

```
$ npm install
$ npm test
```

## Other projects

*Note: inspired by [dependency-check](https://github.com/maxogden/dependency-check). This implementation relies on `Module._compile` to add support Coffee-Script.*

test
