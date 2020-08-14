import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | ref-to', function(hooks) {
  setupRenderingTest(hooks);

  // TODO: Replace this with your real tests.
  test('it renders', async function(assert) {

    await render(hbs`<div {{create-ref "node"}}>ember</div><span>{{get (ref-to "node") "textContent"}}</span>`);

    assert.equal(this.element.querySelector('span').textContent, 'ember');
  });
});
