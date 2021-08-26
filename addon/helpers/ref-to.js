import Helper from '@ember/component/helper';
import { bucketFor, watchFor } from './../utils/ref';
import { registerDestructor, unregisterDestructor } from '@ember/destroyable';
import { getOwner } from '@ember/application';

export default class RefToHelper extends Helper {
  _watcher = null;
  compute([name], { bucket, tracked }) {
    const bucketRef = bucket || getOwner(this);
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
}
