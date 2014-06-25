# require-lint

Parses your code for `require` statements, and checks that:

- all required dependencies are mentioned in `package.json`
- all depedencies in `package.json` are still being used

![npm install](https://nodei.co/npm/require-lint.png?mini=true)

```
$ require-lint

[WARN] Extraneous dependencies: lodash
[ERROR] Missing dependencies: attempt, express
```

Extraneous dependencies only print a warning, but missing dependencies trigger an exit code of `1`.

*Note: require-lint doesn't check dev dependencies, since test code doesn't typically have a single entry point*

## Defaut behaviour

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

```
$ require-lint --src lib/server.js --src lib/worker.js
```

- `--require`

Any file to be required before processing, for example to load extra compilers like [Coffee-Script](http://coffeescript.org/).
These must be absolute paths or available modules.

```
$ require-lint --require coffee-script/register
```

## Dev notes

```
$ npm install
$ npm test
```

## Other projects

*Note: inspired by [dependency-check](https://github.com/maxogden/dependency-check). This implementation relies on `Module._compile` to add support Coffee-Script.*
