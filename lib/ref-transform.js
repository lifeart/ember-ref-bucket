/* eslint-env node */
'use strict';

/*
  ```hbs
  {{create-ref "bar"}}
  {{ref-to "bar"}}
  ```
  becomes
  ```hbs
  {{create-ref "bar" bucket=this}}
  {{ref-to "bar" bucket=this}}
  ```
*/

function refTransform({ syntax }) {
  let b = syntax.builders;

  function transformNode(node) {
    const localNames = ['create-ref', 'ref-to'];
    const globalNames = ['create-global-ref', 'global-ref-to'];
    const trackedNames = [
      'create-tracked-ref',
      'create-tracked-global-ref',
      'tracked-ref-to',
      'tracked-global-ref-to',
    ];
    const typos = {
      'create-global-tracked-ref': 'create-tracked-global-ref',
      'global-tracked-ref-to': 'tracked-global-ref-to',
    };
    const originalName = node.path.original;
    if (Object.keys(typos).includes(originalName)) {
      throw new Error(`
          "ember-ref-bucket", looks like you have typo in modifier or helper name:
           {{${originalName}}} should be {{${typos[originalName]}}}
        `);
    }
    if (
      !originalName ||
      !originalName.includes ||
      !originalName.includes('ref')
    ) {
      return;
    }

    if (
      localNames.includes(originalName) ||
      globalNames.includes(originalName) ||
      trackedNames.includes(originalName)
    ) {
      node.hash.pairs.push(b.pair('debugName', b.string(originalName)));
    }
    if (trackedNames.includes(originalName)) {
      node.path = b.path(node.path.original.replace('tracked-', ''));
      node.hash.pairs = node.hash.pairs.filter(({ key }) => key !== 'tracked');
      node.hash.pairs.push(b.pair('tracked', b.boolean(true)));
    }
    if (globalNames.includes(node.path.original)) {
      node.hash.pairs = node.hash.pairs.filter(({ key }) => key !== 'bucket');
      node.path = b.path(node.path.original.replace('global-', ''));
    } else if (localNames.includes(node.path.original)) {
      if (node.params.length === 2) {
        throw new Error('ember-ref-bucket does not support ember-ref-modifier');
      }
      if (!node.hash.pairs.find(({ key }) => key === 'bucket')) {
        node.hash.pairs.push(b.pair('bucket', b.path('this')));
      }
    }
  }

  return {
    name: 'ref-transform',

    visitor: {
      SubExpression: transformNode,
      ElementModifierStatement: transformNode,
      MustacheStatement: transformNode,
    },
  };
}

module.exports = refTransform;
