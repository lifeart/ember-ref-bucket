import RefToHelper from './ref-to';
import { getOwner } from '@ember/application';

export default class TrackedGlobalRefToHelper extends RefToHelper {
  debugName = 'tracked-global-ref-to';
  compute(positional, named) {
    return super.compute(positional, { ...named, tracked: true });
  }
  ctx() {
    return getOwner(this);
  }
}
