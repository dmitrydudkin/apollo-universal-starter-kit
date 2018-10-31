// tslint:disable:no-unused-expression
import { expect } from 'chai';
import { step } from 'mocha-steps';
import i18n from 'i18next';

import modules from '../..';
import { addResourcesI18n } from '../../../utils';
import settings from '../../../../../settings';
import {
  required,
  match,
  maxLength,
  minLength,
  number,
  string,
  minValue,
  email,
  alphaNumeric,
  phoneNumber,
  validate,
  Schema
} from '../validation';

i18n.init({
  fallbackLng: settings.i18n.fallbackLng,
  resources: {},
  lng: 'en',
  whitelist: settings.i18n.langList
});
addResourcesI18n(i18n, modules.localizations);

describe('Validation functionality works', () => {
  step('Validation "required"  works correctly', () => {
    expect(required('')).to.be.a('string');
    expect(required('work')).to.be.equal(undefined);
  });

  step('Validation "match" works correctly', () => {
    expect(match('name')('Login', { name: 'Login' })).to.be.an('undefined');
    expect(match('name')('Login', { name: 'Loginnn' })).to.be.a('string');
    expect(match('name')('Login', {})).to.be.a('string');
  });

  step('Validation "maxLength" works correctly', () => {
    expect(maxLength(5)('Login')).to.be.an('undefined');
    expect(maxLength(5)('Loginn')).to.be.a('string');
  });

  step('Validation "maxLength" works correctly', () => {
    expect(minLength(5)('Login')).to.be.an('undefined');
    expect(minLength(5)('Logi')).to.be.a('string');
  });

  step('Validation "number" works correctly', () => {
    expect(number(5)).to.be.an('undefined');
    expect(number('5')).to.be.an('undefined');
    expect(number('0')).to.be.an('undefined');
    expect(number('-0')).to.be.an('undefined');
    expect(number('dg')).to.be.a('string');
    expect(number('..11')).to.be.a('string');
  });

  step('Validation "string" works correctly', () => {
    expect(string('string')).to.be.an('undefined');
    expect(string('&*(&*(')).to.be.an('undefined');
    expect(string('!')).to.be.an('undefined');
    expect(string('222')).to.be.an('undefined');
    expect(string('1')).to.be.a('undefined');
    expect(string('')).to.be.a('undefined');
    expect(string(2)).to.be.a('string');
    expect(string(/^[A-Z0-9._%+-]{2,4}$/)).to.be.a('string');
  });

  step('Validation "minValue" works correctly', () => {
    expect(minValue(5)(5)).to.be.an('undefined');
    expect(minValue(5)(4)).to.be.a('string');
  });

  step('Validation "email" works correctly', () => {
    expect(email('test@test.ru')).to.be.an('undefined');
    expect(email('te234st@te32st.com')).to.be.an('undefined');
    expect(email('te-234st@te32st.c')).to.be.a('string');
    expect(email('test*@te32st.com')).to.be.a('string');
  });

  step('Validation "alphaNumeric" works correctly', () => {
    expect(alphaNumeric('d')).to.be.an('undefined');
    expect(alphaNumeric('2')).to.be.an('undefined');
    expect(alphaNumeric('*')).to.be.a('string');
    expect(alphaNumeric('(')).to.be.a('string');
    expect(alphaNumeric('`')).to.be.a('string');
  });

  step('Validation "phoneNumber" works correctly', () => {
    expect(phoneNumber('0639991122')).to.be.an('undefined');
    expect(phoneNumber('+380639991122')).to.be.an('undefined');
    expect(phoneNumber('+38 063 999 11 22')).to.be.an('undefined');
    expect(phoneNumber('639991122')).to.be.a('string');
  });

  step('"validate" should compare the simple input object to input schema ', () => {
    let schema: Schema = { name: [required, minLength(5), maxLength(7)] };
    let dataToValidate: { [key: string]: any } = { name: 'login' };
    expect(validate(dataToValidate, schema)).to.be.empty;

    schema = {
      name: [required, minLength(5), maxLength(8)],
      password: [required, minLength(5), maxLength(8)],
      duplicatePassword: [required, match('password'), minLength(5), maxLength(8)]
    };
    dataToValidate = { name: 'login', password: 'password', duplicatePassword: 'password' };
    expect(validate(dataToValidate, schema)).to.be.empty;

    schema = { name: [required, minLength(5), maxLength(7)] };
    dataToValidate = { name: 'logi' };
    expect(validate(dataToValidate, schema))
      .to.be.an('object')
      .to.haveOwnProperty('name')
      .to.be.a('string');

    schema = {
      name: [required, minLength(5), maxLength(8)],
      password: [required, minLength(5), maxLength(8)],
      duplicatePassword: [required, match('password'), minLength(5), maxLength(8)]
    };
    dataToValidate = { name: 'login', password: 'BadPass', duplicatePassword: 'GoodPass' };
    expect(validate(dataToValidate, schema))
      .to.be.an('object')
      .to.haveOwnProperty('duplicatePassword')
      .to.be.a('string');

    schema = { name: { firstName: [required, minLength(5), maxLength(8)] } };
    dataToValidate = { name: { firstName: 'Name' } };
    expect(validate(dataToValidate, schema))
      .to.be.an('object')
      .to.haveOwnProperty('firstName')
      .to.be.a('string');
  });

  step('"validate" should compare the input object with nested objects to the input schema', () => {
    let schema: Schema = { name: { firstName: [required, minLength(5), maxLength(8)] } };
    let dataToValidate: { [key: string]: any } = { name: { firstName: 'GoodName' } };
    expect(validate(dataToValidate, schema)).to.be.empty;

    schema = { name: { firstName: [required, minLength(5), maxLength(8)] } };
    dataToValidate = { name: { firstName: 'bad' } };
    expect(validate(dataToValidate, schema))
      .to.be.an('object')
      .to.haveOwnProperty('firstName')
      .to.be.a('string');
  });

  step('Should change the language of the validation message from English to Russian and vice versa', () => {
    expect(required('')).to.match(/[a-zA-Z]/g);
    i18n.changeLanguage('ru-RU');
    expect(required('')).to.match(/[а-яА-Я]/g);
    i18n.changeLanguage('en-US');
    expect(required('')).to.match(/[a-zA-Z]/g);
  });
});