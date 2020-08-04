import Controller from '@ember/controller';
import { trackedRef } from 'ember-ref-bucket';

export default class ApplicationController extends Controller {
  @trackedRef('foo') node = null;
  get value() {
    return this.node?.textContent;
  }
}
