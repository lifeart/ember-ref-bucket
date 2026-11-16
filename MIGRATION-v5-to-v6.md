Migrating from v5 to v6
==============================================================================

As part of migrating to the v2 addon format, the build-time AST preprocessor
has been removed. V2 addons have no access to the host app's build pipeline,
so `this` can no longer be auto-injected. You must now pass it explicitly as a
second positional argument to local ref modifiers and helpers:

```hbs
{{! v5 }}
{{create-ref "foo"}}
{{ref-to "foo"}}

{{! v6 }}
{{create-ref "foo" this}}
{{ref-to "foo" this}}
```

Leaving the context out, or passing `null` (as `this` is in template-only
components), now fails with an assertion instead of silently falling back to
the global (owner) bucket.

Global variants (`create-global-ref`, `create-tracked-global-ref`,
`global-ref-to`, `tracked-global-ref-to`) are unchanged and take **no** second
positional argument. Any context passed to them is ignored, so don't add
`this` to global invocations the codemod leaves alone:

```hbs
{{create-global-ref "foo"}}
{{global-ref-to "foo"}}
```

### Template tag (`.gjs` / `.gts`)

In template tag files the modifiers and helpers are imported, and the context
goes in the same place:

```gjs
import createRef from 'ember-ref-bucket/modifiers/create-ref';

// v5
<div {{createRef "foo" bucket=this}}></div>

// v6
<div {{createRef "foo" this}}></div>
```

v5's build-time transform only recognised the kebab-case names, so it never
added `bucket=this` to `createRef` / `refTo` in template tags. GJS code on v5
therefore passes `bucket=this` by hand. In v6 that named argument is no longer
read, and the call fails the missing-context assertion until it's moved to the
second positional argument.

A codemod is provided to automate this change, for `.hbs`, `.gjs` and `.gts`
files:

```sh
npx ember-ref-bucket-codemod ./app ./tests
```

See the [codemod README](codemods/README.md) for full details.
