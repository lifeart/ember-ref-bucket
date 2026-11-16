import createRef from 'ember-ref-bucket/modifiers/create-ref';
import refTo from 'ember-ref-bucket/helpers/ref-to';

<template>
  <div {{createRef "$a"}}></div>
  <div {{createRef "$b" bucket=this}}></div>
  <div {{createRef "$c" bucket=@context}}></div>
  {{refTo "$c" bucket=@context}}
</template>
