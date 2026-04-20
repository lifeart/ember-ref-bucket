import RefModifier from './create-ref';

export default class CreateTrackedRefModifier extends RefModifier {
  isTracked() {
    return true;
  }
}
