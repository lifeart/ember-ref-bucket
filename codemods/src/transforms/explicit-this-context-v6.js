'use strict';

const LOCAL_NAMES = new Set([
  'create-ref',
  'create-tracked-ref',
  'ref-to',
  'tracked-ref-to',
]);

const ALL_KNOWN = new Set([
  ...LOCAL_NAMES,
  'create-global-ref',
  'create-tracked-global-ref',
  'global-ref-to',
  'tracked-global-ref-to',
]);

module.exports = function hbsTransform(env) {
  const { builders: b } = env.syntax;

  function transformNode(node) {
    const name = node.path.original;
    if (!ALL_KNOWN.has(name)) return;

    const bucketIndex = node.hash.pairs.findIndex((p) => p.key === 'bucket');

    if (bucketIndex !== -1) {
      // bucket=someVar -> move to second positional arg
      const { value } = node.hash.pairs[bucketIndex];
      node.params.push(value);
      node.hash.pairs.splice(bucketIndex, 1);
    } else if (LOCAL_NAMES.has(name) && node.params.length < 2) {
      // local variant with no context yet -> add this
      node.params.push(b.path('this'));
    }
    // global variants with no bucket: no change needed
  }

  return {
    ElementModifierStatement: transformNode,
    MustacheStatement: transformNode,
    SubExpression: transformNode,
  };
};
