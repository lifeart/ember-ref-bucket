import Component from '@glimmer/component';
import cr from 'ember-ref-bucket/modifiers/create-tracked-ref';
import { default as rt } from 'ember-ref-bucket/helpers/tracked-ref-to';

export default class Editor extends Component {
  <template>
    <div {{cr "$logo" this attributes=true}}></div>
    <Attribution @logo={{rt "$logo" this}} />
  </template>
}
