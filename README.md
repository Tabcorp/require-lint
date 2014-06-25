# require-lint

`require-lint` parses your code for `require` statements, and checks that:

- all required dependencies are mentioned in `package.json`
- all depedencies in `package.json` are still being used

![npm install](https://nodei.co/npm/require-lint.png?mini=true)

```
$ require-lint

[ERROR] Missing dependencies: attempt, express
[WARN]  Extraneous dependencies: lodash
```

Missing dependencies trigger an exit code of `1`, but extraneous dependencies don't fail the build.

## Defaut behaviour

By default, it looks for a `package.json` in the current folder.

```
$ require-lint
```

It then parses your source from the entry point declared as `main`:

```json
{
    "main": "./lib/index.js"
}
```

## Options

You can also specify the following options

- `--pkg`

The path to your `package.json`.

```
require-lint --pkg ~/dev/thing/package.json
```

- `--entry`

The path to the entry point, in addition to `main`.
You can specify several of these.

```
require-lint --entry ~/dev/foo.js --entry ~/dev/bar.js
```

- `--require`

Any file to be required before processing.
This is useful to load extra compilers like [Coffee-Script](http://coffeescript.org/).

```
require-lint --require coffee-script/register
```

## Other projects

*Note: inspired by [dependency-check](https://github.com/maxogden/dependency-check). This implementation relies on `Module._compile` to add support Coffee-Script.*
