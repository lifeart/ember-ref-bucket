/* eslint-env node */
'use strict';

/*
  ```hbs
  {{ref "bar"}}
  {{ref-to "bar"}}
  ```
  becomes
  ```hbs
  {{ref "bar" bucket=this}}
  {{ref-to "bar" bucket=this}}
  ```
*/

module.exports = class SetTransform {
  transform(ast) {
    let b = this.syntax.builders;

    function transformNode(node) {
      if (node.path.original === 'ref' || node.path.original === 'ref-to') {
        if (!node.hash.pairs.find(({key})=> key === 'bucket')) {
          node.hash.pairs.push(b.pair('bucket', b.path('this')));
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
