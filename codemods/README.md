ember-ref-bucket-codemod
==============================================================================

Codemods for `ember-ref-bucket`.

## Available codemods

| Name | Description |
|---|---|
| `explicit-this-context-v6` | Adds positional `this` to local ref modifier and helper invocations; converts `bucket=someVar` to a positional arg. Covers `.hbs`, `.gjs` and `.gts` |

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
| `{{create-ref "foo" bucket=undefined}}` | `{{create-global-ref "foo"}}` |
| `{{create-global-ref "foo" bucket=this}}` | `{{create-global-ref "foo"}}` |

Global variants (`create-global-ref`, `create-tracked-global-ref`,
`global-ref-to`, `tracked-global-ref-to`) take no context. v5 ignored `bucket=`
on them, so the codemod drops it and otherwise leaves them untouched.

#### Template tag (`.gjs` / `.gts`)

In template tag files the modifiers and helpers are imported, so the codemod
works on whatever name the import created:

```gjs
import createRef from 'ember-ref-bucket/modifiers/create-ref';
import refTo from 'ember-ref-bucket/helpers/ref-to';

// before
<div {{createRef "foo" bucket=this}}></div>
{{refTo "foo" bucket=this}}

// after
<div {{createRef "foo" this}}></div>
{{refTo "foo" this}}
```

Why do GJS files on v5 have `bucket=this` at all? v5's build-time transform
only recognised the kebab-case names (`create-ref`, `ref-to`, …). In a
template tag the call is `createRef` / `refTo`, so the transform never added
`bucket=this`. Without it, refs stayed `null` and the console warned
"Preprocessor was not executed on create-ref modifier", so GJS users had to
write `bucket=this` by hand.

How it works:

- Each `<template>` is found with
  [`content-tag`](https://github.com/embroider-build/content-tag) (the parser
  Ember itself uses), so several templates per file, templates in class
  bodies and templates assigned to variables are all handled. Only the
  template contents are rewritten; the JS/TS around them is left as is.
- A call is only migrated when its name is a default import from
  `ember-ref-bucket/modifiers/<name>` or `ember-ref-bucket/helpers/<name>`,
  including renamed ones (`import cr from 'ember-ref-bucket/modifiers/create-ref'`).
  A local function that happens to be called `createRef` is left alone.
- The same rules as for `.hbs` apply. For `bucket=undefined`, the call is
  switched to the global variant and an import for it is added if the file
  doesn't have one. The import it replaces may become unused; your linter
  will point it out.
- In a standalone `<template>` (a template-only component, not inside a
  class) `this` is `undefined`, so the codemod doesn't add it. Calls there
  that have no context, or use `bucket=this`, are reported as warnings with
  `file:line` for you to fix by hand: pass a real context or use the global
  variant.

Removing `bucket=…` can leave a space before the closing `}}` or `)`
(`{{createRef "foo" this }}`). Run prettier (with
`prettier-plugin-ember-template-tag` for `.gjs` / `.gts`) afterwards to tidy
it up.

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
npx ember-ref-bucket-codemod explicit-this-context-v6 app/components/my-component.gjs
```

Directories are searched for `.hbs`, `.gjs` and `.gts` files.

The codemod is idempotent — running it twice produces the same result.

