import { setGlobalRef, resolveGlobalRef, bucketFor, unregisterNodeDestructor, registerNodeDestructor, getNodeDestructors } from 'ember-ref-bucket/utils/ref';
import { module, test } from 'qunit';
import { destroy, associateDestroyableChild } from '@ember/destroyable';

module('Unit | Utility | ref', function(hooks) {

  hooks.beforeEach(()=>{
    setGlobalRef(null);
  });

  test('setGlobalRef is working', function(assert) {
    const ref = {};
    setGlobalRef(ref);
    assert.equal(ref, resolveGlobalRef());
  });

  test('resolveGlobalRef is working', function(assert) {
    const ref = {};
    // check for no side-effects
    assert.equal(null, resolveGlobalRef());
    setGlobalRef(ref);
    assert.equal(ref, resolveGlobalRef());
  });

  test('nodeDestructors logic', function(assert) {
    const node = {};
    const destructor = () => {};
    assert.equal(getNodeDestructors(node).length, 0);
    registerNodeDestructor(node, destructor);
    assert.equal(getNodeDestructors(node).length, 1);
    unregisterNodeDestructor(node, destructor);
    assert.equal(getNodeDestructors(node).length, 0);
  });

  let sideEffectCheck = null;

  test('buckets', function(assert) {
    const bucket = {};
    const resolvedBucket = bucketFor(bucket);
    assert.ok(resolvedBucket);
    assert.equal(resolvedBucket, bucketFor(bucket));
    sideEffectCheck = resolvedBucket;
  });

  test('buckets side-effects', function(assert) {
    const bucket = {};
    const resolvedBucket = bucketFor(bucket);
    assert.ok(resolvedBucket);
    assert.notEqual(sideEffectCheck, null);
    assert.notEqual(resolvedBucket, sideEffectCheck);
    sideEffectCheck = null;
  });

});
