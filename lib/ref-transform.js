/* eslint-env node */
"use strict";

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

module.exports = class SetTransform {
  transform(ast) {
    let b = this.syntax.builders;
    function transformNode(node) {
      const localNames = ["create-ref", "ref-to"];
      const globalNames = ["create-global-ref", "global-ref-to"];
      const trackedNames = [
        "create-tracked-ref",
        "create-tracked-global-ref",
        "tracked-ref-to",
        "tracked-global-ref-to",
      ];
      const originalName = node.path.original;
      if (
        localNames.includes(originalName) ||
        globalNames.includes(originalName) ||
        trackedNames.includes(originalName)
      ) {
        node.hash.pairs.push(b.pair("debugName", b.string(originalName)));
      }
      if (trackedNames.includes(originalName)) {
        node.path = b.path(node.path.original.replace("tracked-", ""));
        node.hash.pairs = node.hash.pairs.filter(
          ({ key }) => key !== "tracked"
        );
        node.hash.pairs.push(b.pair("tracked", b.boolean(true)));
      }
      if (globalNames.includes(node.path.original)) {
        node.hash.pairs = node.hash.pairs.filter(({ key }) => key !== "bucket");
        node.path = b.path(node.path.original.replace("global-", ""));
      } else if (localNames.includes(node.path.original)) {
        if (node.params.length === 2) {
          throw new Error(
            "ember-ref-bucket does not support ember-ref-modifier"
          );
        }
        if (!node.hash.pairs.find(({ key }) => key === "bucket")) {
          node.hash.pairs.push(b.pair("bucket", b.path("this")));
        }
      }
    }

    this.syntax.traverse(ast, {
      SubExpression: transformNode,
      ElementModifierStatement: transformNode,
      MustacheStatement: transformNode,
    });

    return ast;
  }
};
