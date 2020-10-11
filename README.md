ember-ref-bucket
==============================================================================

This addon created as rethinking of [ember-ref-modifier](https://github.com/lifeart/ember-ref-modifier), with simplified api and without cons of previous implementation.

Allow users get acces to DOM nodes inside component, including wrapping & destroying logic.

Simple, use case will look like:

* applying `ref` modifier with passed name to an element. 
```hbs
<div {{create-ref "FavouriteNode"}}>hello</div>
```

* have access to it inside component class as decorated property. 
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

reference name should be passed as argument for `@ref("field")` decorator, to allow it find reference by name.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.12 or above
* Ember CLI v2.13 or above
* Node.js v10 or above


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

This method will be very useful if we want to wrap node into some library and control it's lifecycle.

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

* If you use dom node if `@tracked` chain calculations, you should use tracked ref.

* If you don't need to rerun tracked chain (for example, you use ref only for some event-based dom access), you should not use tracked ref.

## Definition of `{{crate-tracked-ref}}` modifiers

* If you need to watch for node changes (resize, content, attributes), you can use tracked modifier, it will add resize observer and mutation observer into according element and will mark property as "dirty" for any mutation


## Definition of `{{tracked-ref-to}}` helpers

* If you need to recalculate helper if some dome node changes (size, children, attributes), you need to use `tracked-ref-to` helper.
* If you don't need it (you need to just have ref to dom node), you should choose `ref-to` helper.


## Template-only components

* `create-ref` modifier and `ref-to` helper will not work in template-only components (because of no context), you should use `create-global-ref` and `global-ref-to` instead. Or provide `bucket` param to `create-ref` modifier / helper.

-----------

_Addon provide only 1 modifier (`create-ref`) and 1 helper (`ref-to`), other names will be transformed as described in tables:_

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


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
