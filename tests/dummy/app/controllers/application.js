import Controller from '@ember/controller';
import { trackedRef, registerNodeDestructor, ref } from 'ember-ref-bucket';

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
  @trackedRef('foo', (node) => {
    const instance = new NodeWrapper(node);
    registerNodeDestructor(node, () => instance.destroy());
    return instance;
  })
  node = null;
  get value() {
    return this.node?.value();
  }
  @ref('bar', function (node) {
    const instance = new NodeWrapper(node);
    registerNodeDestructor(node, () => instance.destroy());
    return instance;
  })
  barNode;
}
