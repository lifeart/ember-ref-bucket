import RefToHelper from './ref-to';

export default class TrackedGlobalRefToHelper extends RefToHelper {
  compute([name], named) {
    return super.compute([name], { ...named, tracked: true });
  }
}
