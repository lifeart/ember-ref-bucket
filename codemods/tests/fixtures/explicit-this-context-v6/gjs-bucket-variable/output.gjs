import Component from '@glimmer/component';
import createRef from 'ember-ref-bucket/modifiers/create-ref';
import refTo from 'ember-ref-bucket/helpers/ref-to';

export default class Form extends Component {
  <template>
    <form {{createRef "$form" this.bucket }}></form>
    {{#let @owner as |owner|}}
      <input {{createRef "$input" owner }} />
      {{refTo "$input" owner }}
    {{/let}}
  </template>
}
