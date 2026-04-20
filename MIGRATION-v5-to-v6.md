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

A codemod is provided to automate this change:

```sh
npx ember-ref-bucket-codemod ./app ./tests
```

See the [codemod README](codemods/README.md) for full details.
