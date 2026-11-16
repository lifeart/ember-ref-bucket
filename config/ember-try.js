'use strict';

const getChannelURL = require('ember-source-channel-url');

// The dummy app runs on a modern toolchain (ember-source 6 LTS, ember-qunit 9,
// @ember/test-helpers 5). That stack does not support Ember 3.28, so the
// legacy scenarios swap the test toolchain back to the last versions that do.
// `tests/test-helper.js` is written to boot under both.
const LEGACY_DEV_OVERRIDES = {
  'ember-source': '~3.28.8',
  'ember-cli': '~3.28.6',
  'ember-cli-htmlbars': '^6.3.0',
  'ember-resolver': '^8.1.0',
  'ember-load-initializers': '^2.1.2',
  '@ember/test-helpers': '^2.9.4',
  'ember-qunit': '^6.2.0',
  '@glimmer/component': '^1.1.2',
};

module.exports = async function () {
  return {
    packageManager: 'pnpm',
    scenarios: [
      // `ember-release` goes first on purpose: pnpm reuses versions left in
      // node_modules by the previous scenario, and the legacy stack's
      // @ember/test-waiters 3 does not load on ember-source 7.
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            // ember-source 7 fails to build under older ember-cli releases.
            'ember-cli': '^6.12.0',
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            ...LEGACY_DEV_OVERRIDES,
          },
        },
      },
      // Classic edition only exists on Ember 3.x, so this runs on the 3.28
      // stack with the classic optional features switched on.
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
          devDependencies: {
            ...LEGACY_DEV_OVERRIDES,
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      // NOTE: `ember-beta`, `ember-canary`, `embroider-safe` and
      // `embroider-optimized` are intentionally omitted. This is still a v1
      // addon: embroider's strict resolver needs the v2 addon format, which
      // has not been done yet (PR #83 only removed the AST transform that
      // blocked it). Bring those scenarios back with the v2 conversion.
    ],
  };
};
