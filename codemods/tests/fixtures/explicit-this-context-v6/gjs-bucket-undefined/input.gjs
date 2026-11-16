import Component from '@glimmer/component';
import createRef from "ember-ref-bucket/modifiers/create-ref"
import refTo from "ember-ref-bucket/helpers/ref-to"
import globalRefTo from "ember-ref-bucket/helpers/global-ref-to"

export default class Owner extends Component {
  <template>
    <div {{createRef "$a" bucket=undefined}}></div>
    {{refTo "$a" bucket=undefined}}
  </template>
}
