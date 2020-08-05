import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ref, globalRef } from 'ember-ref-bucket';

module('Integration | Modifier | ref', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    class Item {
      @ref('foo') node;
    }
    this.set('ctx', new Item());
    await render(hbs`<div {{ref "foo" bucket=this.ctx}}>hello</div>`);
    assert.equal(this.ctx.node.textContent, 'hello');
  });

  // Replace this with your real tests.
  test('it renders global', async function(assert) {
    class Item {
      @globalRef('boo') node;
    }
    this.set('ctx', new Item());
    await render(hbs`<div {{ref "boo" bucket=undefined}}>octane</div>`);
    assert.equal(this.ctx.node.textContent, 'octane');
  });
});
