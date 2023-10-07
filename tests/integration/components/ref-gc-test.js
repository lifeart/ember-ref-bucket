import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ref-gc', function (hooks) {
  setupRenderingTest(hooks);

  // TODO: Replace this with your real tests.
  test('it renders', async function (assert) {
    let context = null;
    this.sendContext = (ctx) => {
      context = ctx;
    };

    await render(hbs`<RefGc @sendContext={{this.sendContext}} />`);

    await click('.add-items');

    assert.strictEqual(typeof context[`item-${0}`], 'object');
    assert.strictEqual(context[`item-${0}`].tagName, 'DIV');

    await click('.clear');

    assert.strictEqual(typeof context[`item-${0}`], 'object');
    assert.strictEqual(String(context[`item-${0}`]), 'null');

    await click('.add-items');
    assert.strictEqual(context[`item-${0}`].tagName, 'DIV');
    await click('.clear');
    assert.strictEqual(String(context[`item-${0}`]), 'null');
  });
});
