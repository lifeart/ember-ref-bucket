import Component from '@glimmer/component';
import createRef from 'ember-ref-bucket/modifiers/create-ref';
import refTo from 'ember-ref-bucket/helpers/ref-to';

export default class Form extends Component {
  <template>
    <form {{createRef "$form" bucket=this.bucket}}></form>
    {{#let @owner as |owner|}}
      <input {{createRef "$input" bucket=owner}} />
      {{refTo "$input" bucket=owner}}
    {{/let}}
  </template>
}
