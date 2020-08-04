import { modifier } from "ember-modifier";
import { getOwner } from "@ember/application";
import { registerDestructor } from "@ember/destroyable";
import { tracked } from "@glimmer/tracking";

class FieldCell {
  @tracked value = null;
}

const root = {};
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
const buckets = new WeakMap();
export function bucketFor(rawCtx) {
  const ctx = rawCtx ? rawCtx : root;
  if (!buckets.has(ctx)) {
    buckets.set(ctx, createBucket());
    if (getOwner(ctx)) {
      registerDestructor(ctx, () => {
        buckets.delete(ctx);
      });
    }
  }
  return buckets.get(ctx);
}
export const notificationsFor = {};
export function watchFor(name, bucketRef, cb) {
  const bucket = bucketFor(bucketRef);
  return bucket.addNotificationFor(name, cb);
}
export default modifier(function ref(element, [name], hash) {
  const bucket = bucketFor(hash.bucket);
  bucket.add(name, element);
  return () => {
    bucket.add(name, null);
  };
});
