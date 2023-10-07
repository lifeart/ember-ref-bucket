import { bucketFor, resolveGlobalRef } from './utils/ref';
import { getOwner } from '@ember/application';
export { registerNodeDestructor, unregisterNodeDestructor } from './utils/ref';
import { addPrototypeReference } from './utils/prototype-reference';

export function nodeFor(context, name) {
  return bucketFor(context).get(name);
}

export { resolveGlobalRef };

function maybeReturnCreated(value, createdValues, fn, ctx) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof fn === 'function') {
    if (!createdValues.has(value)) {
      createdValues.set(value, fn.call(ctx, value));
    }
    return createdValues.get(value);
  } else {
    return value;
  }
}

export function ref(name, fn) {
  return function (klass, objectKey) {
    const createdValues = new WeakMap();
    if (typeof fn === 'function') {
      addPrototypeReference(klass, objectKey, name);
    }
    return {
      get() {
        const value = bucketFor(this).get(name);
        return maybeReturnCreated(value, createdValues, fn, this);
      },
      configurable: true,
    };
  };
}

export function globalRef(name, fn) {
  return function (klass, objectKey) {
    const createdValues = new WeakMap();
    if (typeof fn === 'function') {
      addPrototypeReference(klass, objectKey, name);
    }
    return {
      get() {
        const value = bucketFor(getOwner(this) || resolveGlobalRef()).get(name);
        return maybeReturnCreated(value, createdValues, fn, this);
      },
      configurable: true,
    };
  };
}

export function trackedRef(name, fn) {
  return function (klass, objectKey) {
    const createdValues = new WeakMap();
    if (typeof fn === 'function') {
      addPrototypeReference(klass, objectKey, name);
    }
    return {
      get() {
        const value = bucketFor(this).getTracked(name);
        return maybeReturnCreated(value, createdValues, fn, this);
      },
      configurable: true,
    };
  };
}

export function trackedGlobalRef(name, fn) {
  return function (klass, objectKey) {
    const createdValues = new WeakMap();
    if (typeof fn === 'function') {
      addPrototypeReference(klass, objectKey, name);
    }
    return {
      get() {
        const value = bucketFor(
          getOwner(this) || resolveGlobalRef()
        ).getTracked(name);
        return maybeReturnCreated(value, createdValues, fn, this);
      },
      configurable: true,
    };
  };
}
