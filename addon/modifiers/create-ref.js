import Modifier from "ember-modifier";
import { getOwner } from "@ember/application";

import { action } from "@ember/object";
import { assert } from "@ember/debug";
import { setGlobalRef, bucketFor, getNodeDestructors } from "./../utils/ref";

export default class RefModifier extends Modifier {
  _key = this.name;
  _ctx = this.ctx;
  constructor() {
    super(...arguments);
    setGlobalRef(getOwner(this));
  }
  mutationObserverOptions = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  };
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
    assert(
      `You must provide string as first positional argument for {{${this.args.named.debugName}}}`,
      typeof this.name === "string" && this.name.length > 0
    );
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
    assert(
      `ember-ref-bucket: You trying to use {{${this.args.named.debugName}}} as local reference for template-only component. Replace it to {{global-ref "${this.args.positional[0]}"}}`,
      this.args.named.bucket !== null
    );

    return this.args.named.bucket || getOwner(this);
  }
  get isTracked() {
    return this.args.named.tracked || false;
  }
  get name() {
    return this.args.positional[0];
  }
  willDestroy() {
    this.cleanMutationObservers();
    this.cleanResizeObservers();
    getNodeDestructors(this.element).forEach((cb) => cb());
  }
}
