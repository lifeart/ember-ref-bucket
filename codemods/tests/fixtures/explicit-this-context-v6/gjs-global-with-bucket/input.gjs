import Component from '@glimmer/component';
import createGlobalRef from 'ember-ref-bucket/modifiers/create-global-ref';
import globalRefTo from 'ember-ref-bucket/helpers/global-ref-to';

export default class Shell extends Component {
  <template>
    <main {{createGlobalRef "$main" bucket=this}}></main>
    {{globalRefTo "$main" bucket=this}}
    {{globalRefTo "$main"}}
  </template>
}
