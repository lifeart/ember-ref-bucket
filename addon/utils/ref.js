import { registerDestructor, isDestroying, isDestroyed } from "@ember/destroyable";
import { tracked } from "@glimmer/tracking";

let lastGlobalRef = null;
const buckets = new WeakMap();
const nodeDestructors = new WeakMap();

class FieldCell {
  @tracked value = null;
}

export function setGlobalRef(value) {
  lastGlobalRef = value;
}

export function resolveGlobalRef() {
  return lastGlobalRef;
}

function createBucket() {
  return {
    bucket: {},
    keys: {},
    createTrackedCell(key) {
      if (!(key in this.keys)) {
        this.keys[key] = new FieldCell();
      }
    },
    get(name) {
      this.createTrackedCell(name);
      return this.bucket[name] || null;
    },
    dirtyTrackedCell(name) {
      this.createTrackedCell(name);
      const val = this.keys[name].value;
      this.keys[name].value = val;
    },
    getTracked(name) {
      this.createTrackedCell(name);
      return this.keys[name].value;
    },
    add(name, value) {
      this.createTrackedCell(name);
      this.keys[name].value = value;
      this.bucket[name] = value;
      if (!(name in this.notificationsFor)) {
        this.notificationsFor[name] = [];
      }
      this.notificationsFor[name].forEach((fn) => fn());
    },
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
    notificationsFor: {},
  };
}

export function getNodeDestructors(node) {
  return nodeDestructors.get(node) || [];
}
export function registerNodeDestructor(node, cb) {
  if (!nodeDestructors.has(node)) {
    nodeDestructors.set(node, []);
  }
  nodeDestructors.get(node).push(cb);
}
export function unregisterNodeDestructor(node, cb) {
  const destructors = nodeDestructors.get(node) || [];
  nodeDestructors.set(
    node,
    destructors.filter((el) => el !== cb)
  );
}
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
export function watchFor(name, bucketRef, cb) {
  const bucket = bucketFor(bucketRef);
  return bucket.addNotificationFor(name, cb);
}
