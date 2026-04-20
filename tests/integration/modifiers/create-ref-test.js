import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ref, globalRef, nodeFor, resolveGlobalRef } from 'ember-ref-bucket';

module('Integration | Modifier | create-ref', function (hooks) {
  setupRenderingTest(hooks);

  hooks.after(function (assert) {
    assert.equal(
      resolveGlobalRef(),
      null,
      'global ref is cleared after all tests done'
    );
  });

  test('it renders', async function (assert) {
    class Item {
      @ref('foo') node;
    }
    this.set('ctx', new Item());
    await render(hbs`<div {{create-ref "foo" this.ctx}}>hello</div>`);
    assert.equal(this.ctx.node.textContent, 'hello');
  });

  test('it renders global', async function (assert) {
    class Item {
      @globalRef('boo') node;
    }
    this.set('ctx', new Item());
    await render(hbs`<div {{create-ref "boo"}}>octane</div>`);
    assert.equal(this.ctx.node.textContent, 'octane');
  });

  test('it works for {{create-ref}}', async function (assert) {
    await render(hbs`<div {{create-ref "foo" this}}>octane</div>`);
    assert.equal(nodeFor(this, 'foo').textContent, 'octane');
  });

  test('it works for {{create-tracked-ref}}', async function (assert) {
    await render(hbs`<div {{create-tracked-ref "foo" this}}>octane</div>`);
    assert.equal(nodeFor(this, 'foo').textContent, 'octane');
  });

  test('it does not throw when subtree=true is used without other mutation observer options', async function (assert) {
    await render(
      hbs`<div {{create-tracked-ref "foo" this subtree=true}}>hello</div>`
    );
    assert.equal(nodeFor(this, 'foo').textContent, 'hello');
  });

  test('it works for {{create-tracked-ref character=true subtree=true}}', async function (assert) {
    assert.expect(3);
    this.set('text', 'octane');
    await render(hbs`
      <div {{create-tracked-ref "foo" this character=true subtree=true}}>{{this.text}}</div>
      <div data-test-mirror>{{get (tracked-ref-to "foo" this) 'textContent'}}</div>
    `);
    assert.equal(nodeFor(this, 'foo').textContent, 'octane');
    assert.equal(find('[data-test-mirror]').textContent, 'octane');
    this.set('text', 'polaris');
    await waitUntil(() => find('[data-test-mirror]').textContent === 'polaris');
    assert.ok(true);
  });

  test('it works for {{create-global-ref}}', async function (assert) {
    await render(hbs`<div {{create-global-ref "foo"}}>octane</div>`);
    assert.equal(nodeFor(this.owner, 'foo').textContent, 'octane');
  });

  test('it works for {{create-tracked-global-ref}}', async function (assert) {
    await render(hbs`<div {{create-tracked-global-ref "foo"}}>octane</div>`);
    assert.equal(nodeFor(this.owner, 'foo').textContent, 'octane');
  });

  test('it works for {{ref-to}}', async function (assert) {
    await render(
      hbs`<div {{create-ref "foo" this}}>octane</div><div data-test-value>{{get (ref-to "foo" this) 'textContent'}}</div>`
    );
    assert.equal(
      document.querySelector('[data-test-value]').textContent,
      'octane'
    );
  });

  test('it works for {{tracked-ref-to}}', async function (assert) {
    await render(
      hbs`<div {{create-ref "foo" this}}>octane</div><div data-test-value>{{get (tracked-ref-to "foo" this) 'textContent'}}</div>`
    );
    assert.equal(
      document.querySelector('[data-test-value]').textContent,
      'octane'
    );
  });

  test('it works for {{global-ref-to}}', async function (assert) {
    await render(
      hbs`<div {{create-global-ref "foo"}}>octane</div><div data-test-value>{{get (global-ref-to "foo") 'textContent'}}</div>`
    );
    assert.equal(
      document.querySelector('[data-test-value]').textContent,
      'octane'
    );
  });

  test('it works for {{tracked-global-ref-to}}', async function (assert) {
    await render(
      hbs`<div {{create-tracked-global-ref "foo"}}>octane</div><div data-test-value>{{get (tracked-global-ref-to "foo") 'textContent'}}</div>`
    );
    assert.equal(
      document.querySelector('[data-test-value]').textContent,
      'octane'
    );
  });

  test('assert stable local ref', async function (assert) {
    this.set('isToggled', true);
    await render(
      hbs`{{#if this.isToggled}}<div {{create-ref "foo" this}}>octane</div>{{else}}<div {{create-ref "foo" this}}>ember</div>{{/if}}`
    );
    assert.equal(nodeFor(this, 'foo').textContent, 'octane');
    this.set('isToggled', false);
    assert.equal(nodeFor(this, 'foo').textContent, 'ember');
    this.set('isToggled', true);
    assert.equal(nodeFor(this, 'foo').textContent, 'octane');
    this.set('isToggled', false);
    assert.equal(nodeFor(this, 'foo').textContent, 'ember');
  });

  test('assert stable global ref', async function (assert) {
    this.set('isToggled', true);
    await render(
      hbs`{{#if this.isToggled}}<div {{create-global-ref "foo"}}>octane</div>{{else}}<div {{create-global-ref "foo"}}>ember</div>{{/if}}`
    );
    assert.equal(nodeFor(this.owner, 'foo').textContent, 'octane');
    this.set('isToggled', false);
    assert.equal(nodeFor(this.owner, 'foo').textContent, 'ember');
    this.set('isToggled', true);
    assert.equal(nodeFor(this.owner, 'foo').textContent, 'octane');
    this.set('isToggled', false);
    assert.equal(nodeFor(this.owner, 'foo').textContent, 'ember');
  });

  test('it keeps proper reference to lastGlobalRef', async function (assert) {
    this.set('isHidden', false);
    await render(
      hbs`<div {{create-global-ref "foo"}}>stable</div>{{#if this.isHidden}}<div {{create-global-ref "bar"}}>unstable</div>{{/if}}`
    );
    assert.equal(nodeFor(this.owner, 'foo').textContent, 'stable');
    assert.notOk(nodeFor(this.owner, 'bar'), 'ref to "bar" does NOT exist');
    assert.equal(
      nodeFor(resolveGlobalRef(), 'foo').outerHTML,
      '<div>stable</div>'
    );

    this.set('isHidden', true);
    assert.equal(nodeFor(this.owner, 'foo').textContent, 'stable');
    assert.equal(nodeFor(this.owner, 'bar').textContent, 'unstable');
    assert.equal(
      nodeFor(resolveGlobalRef(), 'foo').outerHTML,
      '<div>stable</div>'
    );
    assert.equal(
      nodeFor(resolveGlobalRef(), 'bar').outerHTML,
      '<div>unstable</div>'
    );
  });
});
