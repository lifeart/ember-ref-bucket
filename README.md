ember-ref-bucket
==============================================================================

This addon was created as a rethinking of [ember-ref-modifier](https://github.com/lifeart/ember-ref-modifier), with a more simplified API and without some of the downsides of the previous implementation.

The addon allows users to get access to DOM nodes inside components, including accessing wrapping/destroying logic.

A simple use case:

* applying `ref` modifier with passed name to an element. 
```hbs
<div {{create-ref "FavouriteNode"}}>hello</div>
```

* gain access to it inside the component class as a decorated property
```js
import Component from '@glimmer/component';
import { ref } from 'ember-ref-bucket';

export default class MyComponent extends Component {
  @ref("FavouriteNode") node; 
  // this.node === "<div>hello</div>"
}
```

--------

API differences, comparing to `ember-ref-modifier`:

In `ember-ref-modifier` ref modifier accept 2 positional arguments `{{ref this "property"}}`: 
1. context to set path (`this`)
2. path to set on context (`"property"`)

In `ember-ref-bucket` ref modifier accept 1 positional argument `{{create-ref "field"}}`:
1. reference name (`"field"`)

reference name should be passed as an argument to the `@ref("field")` decorator, to allow it to find the reference by name.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v14 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-ref-bucket
```

Usage
------------------------------------------------------------------------------

## Examples

### Simple player

```hbs
<audio {{create-ref "player"}} src="music.mp3"></audio>
<button {{on "click" this.onPlay}}>Play</button>
```
```js
import Component from '@glimmer/component';
import { ref } from 'ember-ref-bucket';
import { action } from '@ember/object';

export class Player extends Component {
  @ref('player') audioNode;
  @action onPlay() {
    this.audioNode.play()
  }
}

```

### Link `div` to `node` property.

```hbs
<div {{create-ref "field"}} ></div>
```

```ts
import Component from '@glimmer/component';
import { ref } from 'ember-ref-bucket';

export default class MyComponent extends Component {
  @ref("field") node = null;
}
```

### Dynamically show `div` content updates

```hbs
<div {{create-tracked-ref "field"}}>hello</div>

{{get (tracked-ref-to "field") "textContent"}}

```

### Use `div` as component argument

```hbs
<div {{create-ref "field"}}>hello</div>

<SecondComponent @helloNode={{ref-to "field"}} />
```

### Use `registerNodeDestructor`

This method is very useful if you want to wrap the node and control its lifecycle.

```hbs
<div {{create-ref "field"}}>
```

```js
import Component from '@glimmer/component';
import { ref, registerNodeDestructor } from 'ember-ref-bucket';

class NodeWrapper {
  constructor(node) {
    this.node = node;
  }
  destroy() {
    this.node = null;
  }
  value() {
    return this.node.textContent;
  }
}

export default class WrappedNodeComponent extends Component {
  @ref('field', (node) => {
    const instance = new NodeWrapper(node);
    registerNodeDestructor(node, () => instance.destroy());
    return instance;
  }) node = null;
  get value() {
    return this.node?.value();
  }
}
```

## Available decorators:

```js
import { ref, globalRef, trackedRef, trackedGlobalRef } from 'ember-ref-bucket';

/*
  ref - usage: @ref('foo', nodeWrapFn?), ref to bucket with current component context
  globalRef - usage: @globalRef('foo', nodeWrapFn?), ref to global context (app)
  trackedRef - usage: @trackedRef('foo', nodeWrapFn?), tracked ref to local context
  trackedGlobalRef - usage: @trackedGlobalRef('foo', nodeWrapFn?), tracked ref to global context (app)

*/
```

## Available methods:

```js
import { registerNodeDestructor, unregisterNodeDestructor } from 'ember-ref-bucket';

/*
  registerNodeDestructor(node, fn) - to assign any ref-node destructor
  unregisterNodeDestructor(node, fn) - to remove assigned ref-node destructor 

  usage will be like:

  @ref('field', (node) => {
    const item = new InputMask(node);
    registerNodeDestructor(node, () => item.destroy());
    return item;
  });
*/

```

```js
/* 
  nodeFor - functional low-level primitive to get node access
*/

import { nodeFor } from 'ember-ref-bucket';

const domNode = nodeFor(this, 'field');
```

## Definition of `@trackedRef` decorators

* If you use dom node in `@tracked` chain calculations, you should use `trackedRef`.

* If you don't need to rerun the tracked chain (for example, you use `ref` only for some event-based dom access), you should not use `trackedRef`.

## Definition of `{{create-tracked-ref}}` modifiers

* If you need to watch for node changes (resize, content, attributes), you can use the `create-tracked-ref` modifier. It can add observe resizing and mutations for the associated element and will mark it as "dirty" for any mutation.

Options:
* `resize` - default: `false`, if truthy observes the resizing of the DOM element.
* `attributes` - default: `false`, if truthy observes the changing of any attribute on the DOM element.
* `character` - default: `false`, if truthy observes the change of the innerText of the DOM element. Note that setting innerText can change the children or the character depending on the current content of the element.
* `children` - default: `false`, if truthy observes changes to the list of direct children of the DOM element.
* `subtree` - default: `false`, if truthy observes the above options on the entire DOM subtree, not just the element decorated by the modifier.


## Definition of `{{tracked-ref-to}}` helpers

* If you need to recalculate helper if some dom node changes (size, children, attributes), you need to use `tracked-ref-to` helper.
* If you don't need it (you need to just have ref to dom node), you should choose `ref-to` helper.


## Template-only components

* `create-ref` modifier and `ref-to` helpers will not work in template-only components (because of no context). You should use `create-global-ref` and `global-ref-to` instead. You can also provide a `bucket` param to the `create-ref` modifier / helper.

-----------

_The addon provide only 1 modifier (`create-ref`) and 1 helper (`ref-to`). Other derivatives will be transformed, and are described below:_

### Modifiers will be transformed according to this table:

| Invocation                   | Will be transformed to                      |
|------------------------------|---------------------------------------------|
| `{{create-ref "foo"}}`               | `{{create-ref "foo" bucket=this}}`                   |
| `{{create-tracked-ref "foo"}}`        | `{{create-ref "foo" bucket=this tracked=true}}`      |
| `{{create-global-ref "foo"}} `        | `{{create-ref "foo" bucket=undefined}}`              |
| `{{create-tracked-global-ref "foo"}}` | `{{create-ref "foo" bucket=undefined tracked=true}}` |

## Helpers will be transformed according to this table:

| Invocation                   | Will be transformed to                      |
|------------------------------|---------------------------------------------|
| `{{ref-to "foo"}}`               | `{{ref-to "foo" bucket=this}}`                   |
| `{{tracked-ref-to "foo"}}`        | `{{ref-to "foo" bucket=this tracked=true}}`      |
| `{{global-ref-to "foo"}} `        | `{{ref-to "foo" bucket=undefined}}`              |
| `{{tracked-global-ref-to "foo"}}` | `{{ref-to "foo" bucket=undefined tracked=true}}` |


-----------

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


Version matrix:

Ember-Modifier 4 - v5;
Ember 3.28 - v4;
Ember 3.24 - v3


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
