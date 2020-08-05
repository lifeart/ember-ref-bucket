import Helper from '@ember/component/helper';
import { bucketFor, watchFor } from './../modifiers/ref';
import { registerDestructor, unregisterDestructor } from '@ember/destroyable';

export default class RefToHelper extends Helper {
  _watcher = null;
  compute([name], { bucket, tracked }) {
    if (this._name !== name) {
      if (this._watcher) {
        unregisterDestructor(this, this._watcher);
      }
      this._watcher = watchFor(name, bucket, () => {
        this.recompute();
      });
      registerDestructor(this, this._watcher);
      this._name = name;
    }
    if (tracked) {
      return bucketFor(bucket).getTracked(name);
    } else {
      return bucketFor(bucket).get(name);
    }
  }
}
