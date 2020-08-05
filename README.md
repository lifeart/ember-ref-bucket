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

```hbs
<div {{ref "field"}} ></div>
```

```ts
class Component {
  @ref("field") node = null;
}
```

where `{{ref "field"}}` will be transformed to `{{ref this "field"}}`,
and `@ref` decorator will control property access (and will throw error if property does not yeat setted), it should fix all tracked issues.

one more interesting thing, we can share refs between components (we could add ability to have "global" refs), in this case, we will use `@ref("field")` to access ref-bucket, and we can introduce `{{ref-for "field"}}` helper, and it can return actual dom node, with same ref.

it may be `{{global-ref "footer"}}`, `@globalRef("footer")`, `{{global-ref-to "footer"}}`

in therory "ref-bucket" approach may simplify dom ref usages for template-only components, for example

```hbs
<div {{ref "field"}}>hello</div>

{{get (ref-to "field") "textContent"}}

<SecondComponent @helloNode={{ref-to "field"}} />
```



Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
