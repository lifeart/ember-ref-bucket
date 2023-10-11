import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { ref } from 'ember-ref-bucket';

export default class Test extends Component {
  constructor() {
    super(...arguments);
    this.args.sendContext(this);
  }
  /**
   * @type {number[]}
   */
  @tracked items = [];

  @action addItems() {
    this.items = [
      ...this.items,
      ...Array(100)
        .fill(0)
        .map((_, i) => i),
    ];
    this.items.forEach((item) => {
      Object.defineProperty(this, `item-${item}`, ref(`item-${item}`)(this));
    });
  }

  @action clear() {
    // this.items.forEach((item) => {
    //   delete this[`item-${item}`];
    // });
    this.items = [];
  }
}
