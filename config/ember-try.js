'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

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
            'ember-auto-import': '~2.4.0',
            webpack: '~5.67.0',
          },
          dependencies: {
            '@ember/string': '3.1.1',
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
            'ember-auto-import': '~2.4.0',
            webpack: '~5.67.0',
          },
          dependencies: {
            '@ember/string': '3.1.1',
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
            'ember-auto-import': '~2.4.0',
            webpack: '~5.67.0',
          },
          dependencies: {
            '@ember/string': '3.1.1',
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
            'ember-auto-import': '~2.4.0',
          },
        },
      }),
      embroiderOptimized({
        npm: {
          dependencies: {
            'ember-auto-import': '~2.4.0',
          },
        },
      }),
    ],
  };
};
