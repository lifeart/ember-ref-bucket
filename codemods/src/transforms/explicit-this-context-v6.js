'use strict';

const { transform } = require('ember-template-recast');
const { transformTemplateTag } = require('../template-tag');

const LOCAL_NAMES = new Set([
  'create-ref',
  'create-tracked-ref',
  'ref-to',
  'tracked-ref-to',
]);

const GLOBAL_NAMES = new Set([
  'create-global-ref',
  'create-tracked-global-ref',
  'global-ref-to',
  'tracked-global-ref-to',
]);

const ALL_KNOWN = new Set([...LOCAL_NAMES, ...GLOBAL_NAMES]);

// v5 fell back to the owner when bucket was undefined, which is what the
// global variants do in v6
const GLOBAL_EQUIVALENT = {
  'create-ref': 'create-global-ref',
  'create-tracked-ref': 'create-tracked-global-ref',
  'ref-to': 'global-ref-to',
  'tracked-ref-to': 'tracked-global-ref-to',
};

function usesThis(node) {
  return (
    node.type === 'PathExpression' &&
    (node.original === 'this' || node.original.startsWith('this.'))
  );
}

/**
 * Builds the Glimmer plugin.
 *
 * - resolve(name): canonical kebab-case name for an invoked path, if it is
 *   one of ours
 * - thisAvailable: false in template-only <template> blocks, where `this` is
 *   undefined
 * - globalBinding(canonical, node): name to invoke the global variant by, or
 *   undefined to leave the call alone
 * - warn(node, message): reports a call the codemod can't decide on
 */
function createPlugin({
  resolve = (name) => (ALL_KNOWN.has(name) ? name : undefined),
  thisAvailable = true,
  globalBinding = (canonical) => canonical,
  warn = () => {},
} = {}) {
  return function hbsTransform(env) {
    const { builders: b } = env.syntax;

    function transformNode(node) {
      if (node.path.type !== 'PathExpression') return;
      const name = resolve(node.path.original);
      if (!name) return;

      const isGlobal = GLOBAL_NAMES.has(name);
      const bucketIndex = node.hash.pairs.findIndex((p) => p.key === 'bucket');

      if (bucketIndex !== -1) {
        const { value } = node.hash.pairs[bucketIndex];

        if (isGlobal) {
          // v5 ignored bucket on global variants -> just drop it
          node.hash.pairs.splice(bucketIndex, 1);
          return;
        }
        if (value.type === 'UndefinedLiteral') {
          // bucket=undefined meant the owner -> switch to the global variant
          const binding = globalBinding(GLOBAL_EQUIVALENT[name], node);
          if (!binding) return;
          node.hash.pairs.splice(bucketIndex, 1);
          node.path = b.path(binding);
          return;
        }
        if (!thisAvailable && usesThis(value)) {
          warn(
            node,
            `\`bucket=${value.original}\` in a template-only <template>, where \`this\` is undefined. v5 fell back to the owner here; pass a real context or use the global variant.`
          );
          return;
        }
        // bucket=someVar -> move to second positional arg
        node.hash.pairs.splice(bucketIndex, 1);
        node.params.push(value);
      } else if (!isGlobal && node.params.length < 2) {
        if (!thisAvailable) {
          warn(
            node,
            `no context in a template-only <template>, where \`this\` is undefined. Pass a context or use the global variant.`
          );
          return;
        }
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
}

function transformFile(source, file) {
  if (/\.g[jt]s$/.test(file)) {
    return transformTemplateTag(source, file, {
      knownNames: ALL_KNOWN,
      createPlugin,
    });
  }
  return { code: transform(source, createPlugin()).code, warnings: [] };
}

module.exports = createPlugin();
module.exports.createPlugin = createPlugin;
module.exports.transformFile = transformFile;
