ember-ref-bucket
==============================================================================

This addon created as rethinking of `ember-ref-modifier`, with simplified api and without cons of previous implementation.

See https://github.com/lifeart/ember-ref-modifier/issues/345


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


### Modifiers will be transformed according to this table:

| Invocation                   | Will be transformed to                      |
|------------------------------|---------------------------------------------|
| `{{ref "foo"}}`               | `{{ref "foo" bucket=this}}`                   |
| `{{tracked-ref "foo"}}`        | `{{ref "foo" bucket=this tracked=true}}`      |
| `{{global-ref "foo"}} `        | `{{ref "foo" bucket=undefined}}`              |
| `{{tracked-global-ref "foo"}}` | `{{ref "foo" bucket=undefined tracked=true}}` |

## Helpers will be transformed according to this table:

| Invocation                   | Will be transformed to                      |
|------------------------------|---------------------------------------------|
| `{{ref-to "foo"}}`               | `{{ref-to "foo" bucket=this}}`                   |
| `{{tracked-ref-to "foo"}}`        | `{{ref-to "foo" bucket=this tracked=true}}`      |
| `{{global-ref-to "foo"}} `        | `{{ref-to "foo" bucket=undefined}}`              |
| `{{tracked-global-ref-to "foo"}}` | `{{ref-to "foo" bucket=undefined tracked=true}}` |

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

## Definition of `@trackedRef` decorators

* If you use dom node if `@tracked` chain calculations, you should use tracked ref.

* If you don't need to rerun tracked chain (for example, you use ref only for some event-based dom access), you should not use tracked ref.

## Definition of `{{tracked-ref}}` modifiers

* If you need to watch for node changes (resize, content, attributes), you can use tracked modifier, it will add resize observer and mutation observer into according element and will mark property as "dirty" for any mutation


## Definition of `{{tracked-ref-to}}` helpers

* If you need to recalculate helper if some dome node changes (size, children, attributes), you need to use `tracked-ref-to` helper.
* If you don't need it (you need to just have ref to dom node), you should choose `ref-to` helper.


## Template-only components

* `ref` modifier and `ref-to` helper will not work in template-only components (because of no context), you should use `global-ref` and `global-ref-to` instead. Or provide `bucket` param to `ref` modifier / helper.

-----------

## Examples

### Link `div` to `node` property.

```hbs
<div {{ref "field"}} ></div>
```

```ts
class Component {
  @ref("field") node = null;
}
```

### Dynamically show `div` content updates

```hbs
<div {{tracked-ref "field"}}>hello</div>

{{get (tracked-ref-to "field") "textContent"}}

```

### Use `div` as component argument

```hbs
<div {{ref "field"}}>hello</div>

<SecondComponent @helloNode={{ref-to "field"}} />
```

### Use `registerNodeDestructor`

This method will be very useful if we want to wrap node into some library and control it's lifecycle.

```hbs
<div {{ref "field"}}>
```

```js
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

export default class ApplicationController extends Controller {
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

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).