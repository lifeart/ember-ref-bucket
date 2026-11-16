import Application from 'dummy/app';
import config from 'dummy/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import { loadTests } from 'ember-qunit/test-loader';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

// ember-qunit >= 9 no longer loads test modules from `start()`. Loading them
// explicitly (and telling older versions not to do it again) keeps this file
// working for the legacy ember-try scenarios that pin ember-qunit 6.
loadTests();
start({ loadTests: false });
