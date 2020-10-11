import { bucketFor, resolveGlobalRef } from "./utils/ref";
import { getOwner } from "@ember/application";
export {
  registerNodeDestructor,
  unregisterNodeDestructor,
} from "./utils/ref";


export function nodeFor(context, name) {
  return bucketFor(context).get(name);
}

function maybeReturnCreated(value, createdValues, fn, ctx) {
  if (value === null || value === undefined) {
    return null;
  }
  if (fn) {
    if (!createdValues.has(value)) {
      createdValues.set(value, fn.call(ctx, value));
    }
    return createdValues.get(value);
  } else {
    return value;
  }
}

export function ref(name, fn) {
  return function () {
    const createdValues = new WeakMap();
    return {
      get() {
        const value = bucketFor(this).get(name);
        return maybeReturnCreated(value, createdValues, fn, this);
      },
    };
  };
}

export function globalRef(name, fn) {
  return function () {
    const createdValues = new WeakMap();
    return {
      get() {
        const value = bucketFor(getOwner(this) || resolveGlobalRef()).get(name);
        return maybeReturnCreated(value, createdValues, fn, this);
      },
    };
  };
}

export function trackedRef(name, fn) {
  return function () {
    const createdValues = new WeakMap();
    return {
      get() {
        const value = bucketFor(this).getTracked(name);
        return maybeReturnCreated(value, createdValues, fn, this);
      },
    };
  };
}

export function trackedGlobalRef(name, fn) {
  return function () {
    const createdValues = new WeakMap();
    return {
      get() {
        const value = bucketFor(getOwner(this) || resolveGlobalRef()).getTracked(name);
        return maybeReturnCreated(value, createdValues, fn, this);
      },
    };
  };
}
