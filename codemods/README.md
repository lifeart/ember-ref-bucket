ember-ref-bucket-codemod
==============================================================================

Codemods for `ember-ref-bucket`.

## Available codemods

| Name | Description |
|---|---|
| `explicit-this-context-v6` | Adds positional `this` to local ref modifier and helper invocations; converts `bucket=someVar` to a positional arg |

---

### explicit-this-context-v6

As part of migrating `ember-ref-bucket` to the v2 addon format, the build-time
AST preprocessor has been removed. V2 addons have no access to the host app's
build pipeline, so the magic that used to silently rewrite `{{create-ref "foo"}}`
into `{{create-ref "foo" bucket=this}}` is no longer possible.

The upside is that the addon is now more explicit and simpler to reason about —
what you write in your templates is exactly what runs, with no hidden
transformations. The context must now be passed as a second positional argument.

| Before | After |
|---|---|
| `{{create-ref "foo"}}` | `{{create-ref "foo" this}}` |
| `{{create-tracked-ref "foo"}}` | `{{create-tracked-ref "foo" this}}` |
| `{{ref-to "foo"}}` | `{{ref-to "foo" this}}` |
| `{{tracked-ref-to "foo"}}` | `{{tracked-ref-to "foo" this}}` |
| `{{create-ref "foo" bucket=this}}` | `{{create-ref "foo" this}}` |
| `{{create-ref "foo" bucket=someVar}}` | `{{create-ref "foo" someVar}}` |

Global variants (`create-global-ref`, `create-tracked-global-ref`,
`global-ref-to`, `tracked-global-ref-to`) require no change and are left
untouched.

---

## Usage

Run a specific codemod by name:

```sh
npx ember-ref-bucket-codemod explicit-this-context-v6 ./app ./tests
```

Or omit the name to run all available codemods:

```sh
npx ember-ref-bucket-codemod ./app ./tests
```

Or against a single file:

```sh
npx ember-ref-bucket-codemod explicit-this-context-v6 app/components/my-component.hbs
```

The codemod is idempotent — running it twice produces the same result.

