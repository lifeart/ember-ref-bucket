import Component from '@glimmer/component';
import createRef from "ember-ref-bucket/modifiers/create-ref"
import refTo from "ember-ref-bucket/helpers/ref-to"
import globalRefTo from "ember-ref-bucket/helpers/global-ref-to"
import createGlobalRef from "ember-ref-bucket/modifiers/create-global-ref"

export default class Owner extends Component {
  <template>
    <div {{createGlobalRef "$a" }}></div>
    {{globalRefTo "$a" }}
  </template>
}
