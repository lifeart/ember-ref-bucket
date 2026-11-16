import RefModifier from './create-ref';
import { getOwner } from '@ember/application';

export default class CreateGlobalRefModifier extends RefModifier {
  debugName = 'create-global-ref';
  ctx() {
    return getOwner(this);
  }
}
