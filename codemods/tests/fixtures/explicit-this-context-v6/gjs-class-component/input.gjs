import Component from '@glimmer/component';
import { concat } from '@ember/helper';
import { ref } from 'ember-ref-bucket';
import createRef from 'ember-ref-bucket/modifiers/create-ref';
import refTo from 'ember-ref-bucket/helpers/ref-to';
import Popover from './popover';

// Zażółć gęślą jaźń — non-ASCII before the template
export default class Dropdown extends Component {
  @ref('$button') button;

  <template>
    <button
      type="button"
      {{createRef (concat "$menuButton" this.guid) bucket=this}}
    >Menü</button>
    <span {{createRef "$label"}}>{{@label}}</span>
    <Popover
      @anchor={{refTo (concat "$menuButton" this.guid) bucket=this}}
      @label={{refTo "$label"}}
    />
  </template>
}
