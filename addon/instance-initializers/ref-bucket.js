
import { setGlobalRef } from 'ember-ref-bucket/utils/ref';
import { registerDestructor } from "@ember/destroyable";

export function initialize(appInstance) {
  setGlobalRef(appInstance);
  registerDestructor(appInstance, () => {
    setGlobalRef(null);
  });
}

export default {
  initialize
};
