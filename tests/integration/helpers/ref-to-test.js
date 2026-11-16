import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, setupOnerror, resetOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | ref-to', function (hooks) {
  setupRenderingTest(hooks);

  hooks.afterEach(function () {
    resetOnerror();
  });

  // TODO: Replace this with your real tests.
  test('it renders', async function (assert) {
    await render(
      hbs`<div {{create-ref "node" this}}>ember</div><span>{{get (ref-to "node" this) "textContent"}}</span>`
    );

    assert.equal(this.element.querySelector('span').textContent, 'ember');
  });

  test('it asserts when no context is passed', async function (assert) {
    assert.expect(1);
    setupOnerror((error) => {
      assert.ok(
        /\(tracked-ref-to "node"\) requires a context/.test(error.message),
        error.message
      );
    });
    await render(hbs`{{get (tracked-ref-to "node") "textContent"}}`);
  });
});
