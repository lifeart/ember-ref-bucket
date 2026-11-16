import RefToHelper from './ref-to';
import { getOwner } from '@ember/application';

export default class GlobalRefToHelper extends RefToHelper {
  debugName = 'global-ref-to';
  ctx() {
    return getOwner(this);
  }
}
