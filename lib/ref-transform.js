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

/**
 * This function is used to get the original value of the node path
 * respecting the `@glimmer/syntax` deprecations introduced here
 * (https://github.com/glimmerjs/glimmer-vm/pull/1568)
 *
 * @param {AST.Statement} node `@glimmer` AST statement node
 * @returns {string} node path original value
 */
function getNodeOriginalValue(node) {
  if (!node || !node.path) {
    return null;
  } else if (Object.hasOwnProperty.call(node.path, 'value')) {
    return node.path.value;
  } else {
    return node.path.original;
  }
}

function refTransform({ syntax }) {
  let b = syntax.builders;

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

  function transformNode(node) {
    const originalName = getNodeOriginalValue(node);

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
      node.path = b.path(getNodeOriginalValue(node).replace('tracked-', ''));
      node.hash.pairs = node.hash.pairs.filter(({ key }) => key !== 'tracked');
      node.hash.pairs.push(b.pair('tracked', b.boolean(true)));
    }
    if (globalNames.includes(getNodeOriginalValue(node))) {
      node.hash.pairs = node.hash.pairs.filter(({ key }) => key !== 'bucket');
      node.path = b.path(getNodeOriginalValue(node).replace('global-', ''));
    } else if (localNames.includes(getNodeOriginalValue(node))) {
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
