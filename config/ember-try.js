'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

// Scenarios that exercise modern ember-source (release/beta/canary) need a
// modern ember-cli — the pinned ember-cli@3.27 throws inside _initVendorFiles
// when paired with recent ember-source. Bumping ember-cli also drags along
// its test toolchain (ember-cli-htmlbars reads `project.templateCompiler` which
// only exists on new ember-source, @ember/test-helpers 4+ stops doing
// ambient `require('ember-cli-htmlbars')`, ember-qunit 8+ pairs with
// test-helpers 3+, etc.). Keep the main deps untouched.
const MODERN_DEV_OVERRIDES = {
  'ember-cli': '^6.12.0',
  'ember-auto-import': '^2.10.0',
  '@ember/test-helpers': '^4.0.4',
  'ember-qunit': '^8.1.1',
  webpack: '^5.0.0',
};
// `ember-cli-htmlbars` is a runtime dependency of this addon, so scenario
// devDependency overrides won't beat it. Route the bump through the
// `dependencies` section instead.
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
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
            ...MODERN_DEV_OVERRIDES,
          },
          dependencies: {
            '@ember/string': '^3.1.1',
            ...MODERN_RUNTIME_OVERRIDES,
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
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
      // Under strict embroider, @ember/test-helpers@2 expects `ember-cli-htmlbars`
      // to be ambient — strict resolvers reject it. @ember/test-helpers@4 removes
      // that ambient require entirely. ember-qunit 8+ peers on test-helpers 3+.
      embroiderSafe({
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^4.0.4',
            'ember-qunit': '^8.1.1',
          },
          dependencies: {
            'ember-auto-import': '^2.10.0',
            'ember-cli-htmlbars': '^7.0.1',
          },
        },
      }),
      embroiderOptimized({
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^4.0.4',
            'ember-qunit': '^8.1.1',
          },
          dependencies: {
            'ember-auto-import': '^2.10.0',
            'ember-cli-htmlbars': '^7.0.1',
          },
        },
      }),
    ],
  };
};
