import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ref, globalRef, nodeFor } from 'ember-ref-bucket';

module('Integration | Modifier | create-ref', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    class Item {
      @ref('foo') node;
    }
    this.set('ctx', new Item());
    await render(hbs`<div {{create-ref "foo" bucket=this.ctx}}>hello</div>`);
    assert.equal(this.ctx.node.textContent, 'hello');
  });

  // Replace this with your real tests.
  test('it renders global', async function(assert) {
    class Item {
      @globalRef('boo') node;
    }
    this.set('ctx', new Item());
    await render(hbs`<div {{create-ref "boo" bucket=undefined}}>octane</div>`);
    assert.equal(this.ctx.node.textContent, 'octane');
  });

  test('it has proper transform for {{create-ref}} case', async function(assert) {
    await render(hbs`<div {{create-ref "foo"}}>octane</div>`);
    assert.equal(nodeFor(this, "foo").textContent, 'octane');
  });

  test('it has proper transform for {{create-tracked-ref}} case', async function(assert) {
    await render(hbs`<div {{create-tracked-ref "foo"}}>octane</div>`);
    assert.equal(nodeFor(this, "foo").textContent, 'octane');
  });

  test('it has proper transform for {{create-global-ref}} case', async function(assert) {
    await render(hbs`<div {{create-global-ref "foo"}}>octane</div>`);
    assert.equal(nodeFor(this.owner, "foo").textContent, 'octane');
  });

  test('it has proper transform for {{create-tracked-global-ref}} case', async function(assert) {
    await render(hbs`<div {{create-tracked-global-ref "foo"}}>octane</div>`);
    assert.equal(nodeFor(this.owner, "foo").textContent, 'octane');
  });

  test('it has proper transform for {{ref-to}} case', async function(assert) {
    await render(hbs`<div {{create-ref "foo"}}>octane</div><div data-test-value>{{get (ref-to "foo") 'textContent'}}</div>`);
    assert.equal(document.querySelector('[data-test-value]').textContent, 'octane');
  });

  test('it has proper transform for {{tracked-ref-to}} case', async function(assert) {
    await render(hbs`<div {{create-ref "foo"}}>octane</div><div data-test-value>{{get (tracked-ref-to "foo") 'textContent'}}</div>`);
    assert.equal(document.querySelector('[data-test-value]').textContent, 'octane');
  });

  test('it has proper transform for {{global-ref-to}} case', async function(assert) {
    await render(hbs`<div {{create-global-ref "foo"}}>octane</div><div data-test-value>{{get (global-ref-to "foo") 'textContent'}}</div>`);
    assert.equal(document.querySelector('[data-test-value]').textContent, 'octane');
  });

  test('it has proper transform for {{tracked-global-ref-to}} case', async function(assert) {
    await render(hbs`<div {{create-tracked-global-ref "foo"}}>octane</div><div data-test-value>{{get (tracked-global-ref-to "foo") 'textContent'}}</div>`);
    assert.equal(document.querySelector('[data-test-value]').textContent, 'octane');
  });


});
