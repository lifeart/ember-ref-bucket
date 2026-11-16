import Component from '@glimmer/component';
import createRef from 'ember-ref-bucket/modifiers/create-ref';
import refTo from 'ember-ref-bucket/helpers/ref-to';

interface Signature {
  Args: { label: string; items: Array<string> };
  Element: HTMLDivElement;
}

export default class DatePicker extends Component<Signature> {
  guid: string = 'picker';
  trigger?: HTMLElement;

  format = <T extends string>(value: T): T => value;

  <template>
    <div {{createRef "calendarTrigger" bucket=this}} ...attributes>
      {{@label}}
    </div>
    <Calendar @triggerElement={{refTo "calendarTrigger" bucket=this}} />
  </template>
}
