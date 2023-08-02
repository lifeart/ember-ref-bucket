import { registerDestructor } from '@ember/destroyable';
import { cleanGlobalRef } from '../utils/ref';

export function initialize(appInstance) {
  registerDestructor(appInstance, () => {
    cleanGlobalRef();
  });
}

export default {
  initialize,
};
