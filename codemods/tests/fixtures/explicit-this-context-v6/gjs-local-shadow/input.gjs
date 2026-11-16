import Component from '@glimmer/component';
import refTo from 'ember-ref-bucket/helpers/ref-to';

function createRef(name) {
  return () => name;
}

export default class Local extends Component {
  <template>
    <div {{createRef "$local" bucket=this}}></div>
    {{refTo "$local" bucket=this}}
  </template>
}
