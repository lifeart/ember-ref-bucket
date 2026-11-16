import RefModifier from './create-ref';
import { getOwner } from '@ember/application';

export default class CreateTrackedGlobalRefModifier extends RefModifier {
  debugName = 'create-tracked-global-ref';
  isTracked() {
    return true;
  }
  ctx() {
    return getOwner(this);
  }
}
