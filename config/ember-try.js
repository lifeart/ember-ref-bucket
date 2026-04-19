'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

// Scenarios that exercise modern ember-source (release/beta/canary) need a
// modern ember-cli — the pinned ember-cli@3.27 throws inside _initVendorFiles
// when paired with recent ember-source. Pair that bump with ember-source's
// matching ember-auto-import major so the dep graph stays coherent.
const MODERN_EMBER_CLI_OVERRIDES = {
  'ember-cli': '^5.12.0',
  'ember-auto-import': '^2.10.0',
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
      embroiderSafe({
        npm: {
          dependencies: {
            'ember-auto-import': '^2.10.0',
          },
        },
      }),
      embroiderOptimized({
        npm: {
          dependencies: {
            'ember-auto-import': '^2.10.0',
          },
        },
      }),
    ],
  };
};
