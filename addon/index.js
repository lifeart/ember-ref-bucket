import { bucketFor } from './modifiers/ref';
import { getOwner } from "@ember/application";

export function ref(name) {
  return function() {
    return {
      get() {
        return bucketFor(this).get(name);
      }
    }
  }
}

export function globalRef(name) {
  return function() {
    return {
      get() {
        return bucketFor(getOwner(this)).get(name);
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
        return bucketFor(getOwner(this)).getTracked(name);
      }
    }
  }
}
