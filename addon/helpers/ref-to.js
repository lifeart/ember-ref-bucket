import Helper from '@ember/component/helper';
import { bucketFor, watchFor } from './../modifiers/ref';
import { registerDestructor, unregisterDestructor } from '@ember/destroyable';

export default class RefToHelper extends Helper {
  compute([name], { bucket }) {
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
    return bucketFor(bucket).get(name);
  }
}
