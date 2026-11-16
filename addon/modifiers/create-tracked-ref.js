import RefModifier from './create-ref';

export default class CreateTrackedRefModifier extends RefModifier {
  debugName = 'create-tracked-ref';
  isTracked() {
    return true;
  }
}
