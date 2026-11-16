import Component from '@glimmer/component';
import createRef from 'ember-ref-bucket/modifiers/create-ref';
import refTo from 'ember-ref-bucket/helpers/ref-to';

const Label = <template>
  <label {{createRef "$label" @owner }}>{{yield}}</label>
</template>;

export default class InputGroup extends Component {
  <template>
    <Label @owner={{this}}>
      <input {{createRef "$input" this }} />
    </Label>
    {{refTo "$input" this}}
  </template>
}
