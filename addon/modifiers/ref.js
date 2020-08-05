import Modifier from "ember-modifier";
import { getOwner } from "@ember/application";
import { registerDestructor } from "@ember/destroyable";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

class FieldCell {
  @tracked value = null;
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
const buckets = new WeakMap();
export function bucketFor(rawCtx) {
  const ctx = rawCtx;
  if (!buckets.has(ctx)) {
    buckets.set(ctx, createBucket());
    registerDestructor(ctx, () => {
      buckets.delete(ctx);
    });
  }
  return buckets.get(ctx);
}
export const notificationsFor = {};
export function watchFor(name, bucketRef, cb) {
  const bucket = bucketFor(bucketRef);
  return bucket.addNotificationFor(name, cb);
}
export default class RefModifier extends Modifier {
  _key = this.name;
  _ctx = this.ctx;
  mutationObserverOptions = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  }
  @action
  markDirty() {
    bucketFor(this._ctx).dirtyTrackedCell(this._key);
  }
  cleanMutationObservers() {
    if (this._mutationsObserver) {
      this._mutationsObserver.disconnect();
    }
  }
  cleanResizeObservers() {
    if (this._resizeObserver) {
      this._resizeObserver.unobserve(this.element);
    }
  }
  installMutationObservers() {
    this._mutationsObserver = new MutationObserver(this.markDirty);
    this._mutationsObserver.observe(this.element, this.mutationObserverOptions);
  }
  installResizeObservers() {
    this._resizeObserver = new ResizeObserver(this.markDirty);
    this._resizeObserver.observe(this.element);
  }
  didReceiveArguments() {
    this.cleanMutationObservers();
    this.cleanResizeObservers();
    if (this.name !== this._key || this._ctx !== this.ctx) {
      bucketFor(this._ctx).add(this._key, null);
    }
    this._ctx = this.ctx;
    this._key = this.name;
    bucketFor(this.ctx).add(this.name, this.element);
    if (this.isTracked) {
      this.installMutationObservers();
      this.installResizeObservers();
    }
  }
  get ctx() {
    return this.args.named.bucket || getOwner(this);
  }
  get isTracked() {
    return this.args.named.tracked || false;
  }
  get name() {
    return this.args.positional[0];
  }
  willDestroy() {
    bucketFor(this.ctx).add(this.name, null);
    this.cleanMutationObservers();
    this.cleanResizeObservers();
  }
}
