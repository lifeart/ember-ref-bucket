import Modifier from 'ember-modifier';
import { getOwner } from '@ember/application';

import { action } from '@ember/object';
import { assert } from '@ember/debug';
import {
  setGlobalRef,
  bucketFor,
  getNodeDestructors,
  watchFor,
} from './../utils/ref';
import { getReferencedKeys } from '../utils/prototype-reference';
import { registerDestructor } from '@ember/destroyable';

export default class RefModifier extends Modifier {
  _key;
  _ctx;
  _element;

  constructor() {
    super(...arguments);
    setGlobalRef(getOwner(this));

    registerDestructor(this, () => {
      const element = this._element;
      this.cleanMutationObservers();
      this.cleanResizeObservers();
      getNodeDestructors(element).forEach((cb) => cb());
      if (element === bucketFor(this._ctx).get(this._key)) {
        bucketFor(this._ctx).add(this._key, null);
      }
      delete this._element;
    });
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
      this._resizeObserver.unobserve(this._element);
    }
  }
  installMutationObservers(named = {}) {
    this._mutationsObserver = new MutationObserver(this.markDirty);
    const opts = this.getObserverOptions(named);
    delete opts.resize;
    if (opts.attributes || opts.characterData || opts.childList) {
      // mutations observer throws if observe is attempted
      // with all these options disabled
      this._mutationsObserver.observe(this._element, opts);
    }
  }
  validateTrackedOptions(named = {}) {
    const args = ['subtree', 'attributes', 'children', 'resize', 'character'];

    if (args.some((name) => name in named)) {
      assert(
        `ember-ref-bucket: observer options (${args.join(
          ', '
        )}) require the tracked flag or a tracked alias`,
        this.isTracked(named)
      );
    }
  }
  getObserverOptions(named = {}) {
    // to minimise overhead user
    // should be specific about
    // what they want to observe
    let resize = false;
    let subtree = this.defaultMutationObserverOptions.subtree;
    let attributes = this.defaultMutationObserverOptions.attributes;
    let character = this.defaultMutationObserverOptions.characterData;
    let children = this.defaultMutationObserverOptions.childList;
    if ('subtree' in named) {
      subtree = named.subtree;
    }
    if ('attributes' in named) {
      attributes = named.attributes;
    }
    if ('children' in named) {
      children = named.children;
    }
    if ('resize' in named) {
      resize = named.resize;
    }
    if ('character' in named) {
      character = named.character;
    }
    return {
      subtree,
      attributes,
      childList: children,
      resize,
      characterData: character,
    };
  }
  installResizeObservers(element) {
    this._resizeObserver = new ResizeObserver(this.markDirty);
    this._resizeObserver.observe(element);
  }
  modify(element, positional, named) {
    const name = this.name(positional);
    const ctx = this.ctx(positional);
    this._key = name;
    this._ctx = ctx;
    this._element = element;

    assert(
      `ember-ref-bucket: You must provide a string as the first positional argument for {{create-ref}}`,
      typeof name === 'string' && name.length > 0
    );
    this.validateTrackedOptions(named);
    this.cleanMutationObservers();
    this.cleanResizeObservers();
    if (name !== this._key || this._ctx !== ctx) {
      bucketFor(this._ctx).add(this._key, null);
    }

    watchFor(name, ctx, () => {
      const keys = getReferencedKeys(ctx, name);
      keys.forEach((keyName) => {
        // consume keys with callbacks
        ctx[keyName];
      });
    });
    bucketFor(ctx).add(name, element);
    if (this.isTracked(named)) {
      this.installMutationObservers(named);

      if (this.getObserverOptions(named).resize) {
        this.installResizeObservers(element);
      }
    }
  }

  ctx([, context] = []) {
    return context ?? getOwner(this);
  }
  isTracked(named = {}) {
    return named.tracked || false;
  }
  name(positional) {
    return positional[0];
  }
}
