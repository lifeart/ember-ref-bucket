import { bucketFor } from './modifiers/ref';

export function ref(name) {
  return function() {
    return {
      get() {
        return bucketFor(this).get(name);
      }
    }
  }
}

export function trackedRef(name) {
  return function() {
    return {
      get() {
        return bucketFor(this).getTracked(name);
      }
    }
  }
}

export function trackedGlobalRef(name) {
  return function() {
    return {
      get() {
        return bucketFor().get(name);
      }
    }
  }
}
