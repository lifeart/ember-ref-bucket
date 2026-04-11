import RefModifier from './create-ref';
import { getOwner } from '@ember/application';

export default class CreateTrackedGlobalRefModifier extends RefModifier {
  isTracked() {
    return true;
  }
  ctx() {
    return getOwner(this);
  }
}
