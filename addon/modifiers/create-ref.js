import Modifier from "ember-modifier";
import { getOwner } from "@ember/application";

import { action } from "@ember/object";
import { assert } from "@ember/debug";
import { setGlobalRef, bucketFor, getNodeDestructors, watchFor } from "./../utils/ref";
import { getReferencedKeys } from "../utils/prototype-reference";
export default class RefModifier extends Modifier {
  _key = this.name;
  _ctx = this.ctx;
  constructor() {
    super(...arguments);
    setGlobalRef(getOwner(this));
  }
  // to minimise overhead, user should be specific about
  // what they want to observe
  defaultMutationObserverOptions = {
    attributes: false,
    characterData: false,
    childList: false,
    subtree: false,
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
    const opts = this.getObserverOptions();
    delete opts.resize;
    if (opts.attributes || opts.characterdata || opts.childlist) {
      // mutations observer throws if observe is attempted
      // with all these options disabled
      this._mutationsObserver.observe(this.element, opts);
    }
  }
  validateTrackedOptions() {
    const args = ['subtree', 'attributes', 'children', 'resize', 'character'];
    if (args.some((name)=>name in this.args.named)) {
      assert(`"ember-ref-modifier", looks like you trying to use {{${this.args.named.debugName}}} without tracked flag or alias, but, with properties, related to tracked modifier (${args.join(', ')})`, this.isTracked);
    }
  }
  getObserverOptions() {
    // to minimise overhead user
    // should be specific about
    // what they want to observe
    let resize = false;
    let subtree = this.defaultMutationObserverOptions.subtree;
    let attributes = this.defaultMutationObserverOptions.attributes;
    let character = this.defaultMutationObserverOptions.characterData;
    let children = this.defaultMutationObserverOptions.childList;
    if ('subtree' in this.args.named) {
      subtree = this.args.named.subtree;
    }
    if ('attributes' in this.args.named) {
      attributes = this.args.named.attributes;
    }
    if ('children' in this.args.named) {
      children = this.args.named.children;
    }
    if ('resize' in this.args.named) {
      resize = this.args.named.resize;
    }
    if ('character' in this.args.named) {
      character = this.args.named.character;
    }
    return {
      subtree, attributes,
      childList: children,
      resize,
      characterData: character
    };
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
    this.validateTrackedOptions();
    this.cleanMutationObservers();
    this.cleanResizeObservers();
    if (this.name !== this._key || this._ctx !== this.ctx) {
      bucketFor(this._ctx).add(this._key, null);
    }
    this._ctx = this.ctx;
    this._key = this.name;
    watchFor(this.name, this.ctx, () => {
      const keys = getReferencedKeys(this.ctx, this.name);
      keys.forEach((keyName) => {
        // consume keys with callbacks
        this.ctx[keyName];
      })
    });
    bucketFor(this.ctx).add(this.name, this.element);
    if (this.isTracked) {
      this.installMutationObservers();

      if (this.getObserverOptions().resize) {
        this.installResizeObservers();
      }
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
    const element = this.element;
    this.cleanMutationObservers();
    this.cleanResizeObservers();
    getNodeDestructors(element).forEach((cb) => cb());
    if (element === bucketFor(this._ctx).get(this._key)) {
      bucketFor(this._ctx).add(this._key, null);
    }
    delete this.element;
  }
}
