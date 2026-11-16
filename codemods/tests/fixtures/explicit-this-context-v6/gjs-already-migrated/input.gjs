import Component from '@glimmer/component';
import createRef from 'ember-ref-bucket/modifiers/create-ref';
import refTo from 'ember-ref-bucket/helpers/ref-to';
import createGlobalRef from 'ember-ref-bucket/modifiers/create-global-ref';

export default class Done extends Component {
  <template>
    <div {{createRef "$a" this}}></div>
    <div {{createRef "$b" this.ctx}}></div>
    <div {{createGlobalRef "$c"}}></div>
    {{refTo "$a" this}}
  </template>
}
