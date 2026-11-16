import Helper from '@ember/component/helper';
import { bucketFor, watchFor } from './../utils/ref';
import { registerDestructor, unregisterDestructor } from '@ember/destroyable';
import { assert } from '@ember/debug';

export default class RefToHelper extends Helper {
  debugName = 'ref-to';
  _watcher = null;
  compute(positional, { tracked }) {
    const [name] = positional;
    const bucketRef = this.ctx(positional);
    if (this._name !== name) {
      if (this._watcher) {
        unregisterDestructor(this, this._watcher);
      }
      this._watcher = watchFor(name, bucketRef, () => {
        this.recompute();
      });
      registerDestructor(this, this._watcher);
      this._name = name;
    }
    if (tracked) {
      return bucketFor(bucketRef).getTracked(name);
    } else {
      return bucketFor(bucketRef).get(name);
    }
  }
  ctx([name, context] = []) {
    assert(
      `ember-ref-bucket: (${this.debugName} "${name}") requires a context as the second positional argument, e.g. (${this.debugName} "${name}" this). In template-only components, where \`this\` is null, use a global variant instead.`,
      context !== undefined && context !== null
    );
    return context;
  }
}
