'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

// Scenarios that exercise modern ember-source (release/beta/canary) need a
// modern ember-cli — the pinned ember-cli@3.27 throws inside _initVendorFiles
// when paired with recent ember-source. Bumping ember-cli also drags along
// its test toolchain (ember-cli-htmlbars reads `project.templateCompiler` which
// only exists on new ember-source, @ember/test-helpers 3.x pairs with
// ember-qunit 8.x, etc.). Keep the main devDependencies untouched.
const MODERN_EMBER_CLI_OVERRIDES = {
  'ember-cli': '^6.12.0',
  'ember-cli-htmlbars': '^7.0.1',
  'ember-auto-import': '^2.10.0',
  '@ember/test-helpers': '^3.3.1',
  'ember-qunit': '^8.1.1',
  webpack: '^5.0.0',
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
            ...MODERN_EMBER_CLI_OVERRIDES,
          },
          dependencies: {
            '@ember/string': '^3.1.1',
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
            ...MODERN_EMBER_CLI_OVERRIDES,
          },
          dependencies: {
            '@ember/string': '^3.1.1',
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
            ...MODERN_EMBER_CLI_OVERRIDES,
          },
          dependencies: {
            '@ember/string': '^3.1.1',
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
      // Under strict embroider, @ember/test-helpers@2 expects `ember-cli-htmlbars`
      // to be ambient, which embroider-safe/optimized reject. `@ember/test-helpers@3`
      // resolves it through its own deps, and ember-qunit 8+ peers on it.
      embroiderSafe({
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^3.3.1',
            'ember-qunit': '^8.1.1',
          },
          dependencies: {
            'ember-auto-import': '^2.10.0',
          },
        },
      }),
      embroiderOptimized({
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^3.3.1',
            'ember-qunit': '^8.1.1',
          },
          dependencies: {
            'ember-auto-import': '^2.10.0',
          },
        },
      }),
    ],
  };
};
