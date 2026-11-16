import RefToHelper from './ref-to';

export default class TrackedRefToHelper extends RefToHelper {
  debugName = 'tracked-ref-to';
  compute(positional, named) {
    return super.compute(positional, { ...named, tracked: true });
  }
}
