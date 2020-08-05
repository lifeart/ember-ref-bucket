ember-ref-bucket
==============================================================================

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
  ref - usage: @ref('foo'), ref to bucket with current component context
  globalRef - usage: @globalRef('foo'), ref to global context (app)
  trackedRef - usage: @trackedRef('foo'), tracked ref to local context
  trackedGlobalRef - usage: @trackedGlobalRef('foo'), tracked ref to global context (app)
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


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
