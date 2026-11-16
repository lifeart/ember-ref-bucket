# How To Contribute

## Installation

Development needs Node.js 20.19 or newer and pnpm 10 (the published addon
itself has no such requirement).

* `git clone <repository-url>`
* `cd ember-ref-bucket`
* `pnpm install`

## Linting

* `pnpm lint`
* `pnpm lint:fix`

## Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

## Codemod

The migration codemod lives in `codemods/` as a separate package
(`ember-ref-bucket-codemod`). It is a pnpm workspace member, so the root
`pnpm install` covers it.

* `pnpm --filter ember-ref-bucket-codemod test`

## Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## Releasing

Releases are done by hand from `master`; CI only runs lint and tests.

### Addon (`ember-ref-bucket`)

1. Make sure CI is green on `master`, including every `Tests - <scenario>` job.
2. Bump `version` in `package.json` and commit it as `Bump version to X.Y.Z`.
3. Tag the commit with the bare version (no `v` prefix): `git tag -a X.Y.Z -m "X.Y.Z"`.
4. `git push origin master --follow-tags`
5. `npm publish` (asks for a one-time password).
6. Create a GitHub release for the tag: `gh release create X.Y.Z --title "<short summary>" --generate-notes`.

`npm pack --dry-run` shows what will be published; `.npmignore` keeps the
dummy app, CI config and `codemods/` out of the tarball.

### Codemod (`ember-ref-bucket-codemod`)

The codemod is versioned and published independently of the addon.

1. Bump `version` in `codemods/package.json` and commit.
2. `cd codemods && npm publish`

The addon's version tags do not cover the codemod. If a tag is wanted, use a
prefixed one such as `codemod-X.Y.Z`.
