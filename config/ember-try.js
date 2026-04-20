'use strict';

const getChannelURL = require('ember-source-channel-url');

// Scenarios that exercise modern ember-source need a modern test toolchain —
// the pinned `ember-cli@3.27` + `ember-cli-htmlbars@6` + `@ember/test-helpers@2`
// stack throws inside `_initVendorFiles` / `templateCompilerPath` against new
// ember-source. Kept as per-scenario overrides so the main lockfile and the
// basic Tests job are untouched.
const MODERN_DEV_OVERRIDES = {
  'ember-cli': '^6.12.0',
  'ember-resolver': '^13.0.0',
  'ember-auto-import': '^2.10.0',
  '@ember/test-helpers': '^4.0.4',
  'ember-qunit': '^8.1.1',
  webpack: '^5.0.0',
};
// `ember-cli-htmlbars` is a runtime `dependency` of this addon. Scenario
// devDependency overrides won't beat it, so route the bump through the
// scenario's `dependencies` section instead.
const MODERN_RUNTIME_OVERRIDES = {
  'ember-cli-htmlbars': '^7.0.1',
};

module.exports = async function () {
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.8',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            ...MODERN_DEV_OVERRIDES,
          },
          dependencies: {
            '@ember/string': '^3.1.1',
            ...MODERN_RUNTIME_OVERRIDES,
          },
        },
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          ember: {
            edition: 'classic',
          },
        },
      },
      // NOTE: `ember-beta`, `ember-canary`, `embroider-safe` and
      // `embroider-optimized` are intentionally omitted. Getting them green
      // requires the v2 addon format migration (see PR #83): the legacy
      // `ember` barrel module they depend on is removed in ember-source 7,
      // and embroider's strict resolver rejects ember-qunit's v1-style
      // `@ember/test/adapter` import. Those scenarios should come back once
      // the addon converts to v2.
    ],
  };
};
