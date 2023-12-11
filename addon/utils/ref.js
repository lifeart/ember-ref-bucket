// @ts-check
/*eslint no-undef: "warn"*/

import {
  registerDestructor,
  isDestroying,
  isDestroyed,
} from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';

/**
 * @type {object | null}
 */
let lastGlobalRef = null;
/**
 * @type {WeakMap<object, ReturnType<typeof createBucket>>}
 */
const buckets = new WeakMap();
/**
 * @type {WeakMap<HTMLElement, Array<() => void>>}
 */
const nodeDestructors = new WeakMap();

const hasWeakRef = typeof WeakRef !== 'undefined';

function fromWeakRefIfSupported(node) {
  if (hasWeakRef && node instanceof WeakRef) {
    return node.deref() ?? null;
  }
  return node;
}

/**
 *
 * @param {null | undefined | WeakRef | HTMLElement } node
 * @returns
 */
function toWeakRefIfSupported(node) {
  if (node === null || node === undefined) {
    return null;
  }
  if (hasWeakRef) {
    if (node instanceof WeakRef) {
      return node;
    }

    return new WeakRef(node);
  }
  return node;
}

class FieldCell {
  /**
  /**
   * @type {null | (WeakRef<HTMLElement> | HTMLElement)}
   */
  @tracked
  _element = null;
  get value() {
    if (this._element) {
      return fromWeakRefIfSupported(this._element);
    } else {
      return null;
    }
  }
  set value(element) {
    if (element) {
      this._element = toWeakRefIfSupported(element);
    } else {
      this._element = null;
    }
  }
}

export function setGlobalRef(value) {
  lastGlobalRef = value;
}

export function cleanGlobalRef() {
  lastGlobalRef = null;
}

export function resolveGlobalRef() {
  return lastGlobalRef;
}

function createBucket() {
  return {
    /**
     * @type { Record<string, HTMLElement> }
     */
    bucket: {},
    /**
     * @type { Record<string, FieldCell> }
     */
    keys: {},
    /**
     * @param {string} key
     */
    createTrackedCell(key) {
      if (!(key in this.keys)) {
        this.keys[key] = new FieldCell();
      }
    },
    /**
     * @param {string} name
     * @returns { HTMLElement | null }
     */
    get(name) {
      this.createTrackedCell(name);
      return fromWeakRefIfSupported(this.bucket[name]) || null;
    },
    /**
     * @param {string} name
     */
    dirtyTrackedCell(name) {
      this.createTrackedCell(name);
      const val = this.keys[name].value;
      this.keys[name].value = val;
    },
    /**
     * @param {string} name
     */
    getTracked(name) {
      this.createTrackedCell(name);
      return this.keys[name].value;
    },
    /**
     * @param {string} name
     * @param {HTMLElement} value
     */
    add(name, value) {
      this.createTrackedCell(name);
      this.keys[name].value = value;
      this.bucket[name] = toWeakRefIfSupported(value);
      if (!(name in this.notificationsFor)) {
        this.notificationsFor[name] = [];
      }
      this.notificationsFor[name].forEach((fn) => fn());
    },
    /**
     * @param {string} name
     * @param {() => void} fn
     */
    addNotificationFor(name, fn) {
      if (!(name in this.notificationsFor)) {
        this.notificationsFor[name] = [];
      }
      this.notificationsFor[name].push(fn);
      return () => {
        this.notificationsFor[name] = this.notificationsFor[name].filter(
          (cb) => cb !== cb
        );
      };
    },
    /**
     * @type { Record<string, Array<() => void>> }
     */
    notificationsFor: {},
  };
}

/**
 *
 * @param {HTMLElement} node
 * @returns {Array<() => void>}
 */
export function getNodeDestructors(node) {
  return nodeDestructors.get(node) || [];
}

/**
 * @param {HTMLElement} node
 * @param {() => void} cb
 */
export function registerNodeDestructor(node, cb) {
  if (!nodeDestructors.has(node)) {
    nodeDestructors.set(node, []);
  }
  nodeDestructors.get(node)?.push(cb);
}
/**
 *
 * @param {HTMLElement} node
 * @param {()=> void} cb
 */
export function unregisterNodeDestructor(node, cb) {
  const destructors = nodeDestructors.get(node) || [];
  nodeDestructors.set(
    node,
    destructors.filter((el) => el !== cb)
  );
}
/**
 *
 * @param {object} rawCtx
 * @returns {ReturnType<typeof createBucket> | undefined}
 */
export function bucketFor(rawCtx) {
  const ctx = rawCtx;
  if (!buckets.has(ctx)) {
    buckets.set(ctx, createBucket());
    if (isDestroyed(ctx) || isDestroying(ctx)) {
      try {
        return buckets.get(ctx);
      } finally {
        buckets.delete(ctx);
      }
    }
    registerDestructor(ctx, () => {
      buckets.delete(ctx);
    });
  }
  return buckets.get(ctx);
}
/**
 *
 * @param {string} name
 * @param {object} bucketRef
 * @param {()=>void} cb
 * @returns
 */
export function watchFor(name, bucketRef, cb) {
  const bucket = bucketFor(bucketRef);
  return bucket?.addNotificationFor(name, cb);
}
