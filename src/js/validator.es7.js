'use strict';

/**
 * @name validator.js
 * @version 0.1
 * @author Vitali Shapovalov
 * @fileoverview
 * This module is to validate HTML forms.
 * Text fields, emails, phones, checkobxes etc.
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Validator module */
export default class Validator {

  /**
   * Create new validation instance.
   *
   * @param {HTMLElement|jQuery} form - form to validate
   * @param {Function|Object} ajaxOptions - function that should return AJAX request options
   * @param {Object} [options] - user specified options
   * @param {Boolean} [options.nestedInModal=false] - when true, remove fields incorrect state on modal hide
   * @param {String} [options.fieldsSelector='.form-input'] - form's field selector string
   * @param {Boolean} [options.removeOnFocusOut=false] - when true, remove fields incorrect state when clicked outside the form
   */
  constructor(form = $(), ajaxOptions = {}, options = {}) {

    /**
     * Form to validate
     *
     * @type {jQuery}
     * @public
     */
    this.$form = $(form);

    /**
     * User-specified AJAX options
     *
     * @type {Function|Object}
     * @public
     */
    this.ajaxOptions = ajaxOptions;

    /**
     * User-specified options
     *
     * @type {Object}
     * @public
     */
    this.options = {
      modal: options.nestedInModal || false,
      fieldsSelector: options.fieldsSelector || '.form-input',
      removeOnFocusOut: options.removeOnFocusOut || false
    };

    /**
     * Default options
     *
     * @type {Object}
     * @protected
     */
    this.DEFAULTS = {
      // SELECTORS
      incorrectFields: '.incorrect',
      error: '.error',

      // CLASS NAMES
      incorrect: 'incorrect',
      formIsValid: 'validated',

      // ERROR MESSAGES TEXT
      emptyField: 'Заполните поле',
      incorrectPhone: 'Введите корректный номер',
      incorrectEmail: 'Введите корректный Email',
      incorrectSelect: 'Выберите один из вариантов',

      // 'data-' TYPES
      dataType: 'validation-type',
      textDataName: 'validation-text',
      dataCondition: 'validation-condition',

      // 'data-validation-type=' VALUE TYPES
      textType: 'text',
      phoneType: 'phone',
      emailType: 'email',
      checkboxType: 'checkbox',
      radioType: 'radio',
      selectType: 'select',

      // 'data-validation-condition=' VALUE TYPES
      minLength: 'min-length',
      maxLength: 'max-length',
      minMaxLength: 'min-max-length',
      length: 'length',
      equal: 'equal',

      // 'data-validation=' VALUE TYPES
      requiredToValidate: 'required'
    };

    /**
     * Buffer object
     *
     * @public
     */
    this.buffer = {};

    /** Initialize */
    this.init();
  }

  /**
   * DOM elements (dynamically selected)
   *
   * @protected
   */
  get ELEMENTS () {
    const _this = this;
    const $form = _this.$form;

    return {
      modal: () => $form.parents('.modal'),
      button: () => $form.find('.validate-form-button'),
      inputs: () => $form.find('input, textarea, select'),
      fields: () => $form.find(_this.options.fieldsSelector)
    };
  }

  /**
   * Check form for validness
   *
   * @return {Boolean}
   */
  formIsValid () {
    const DEFAULTS = this.DEFAULTS;
    const incorrectFields = this.$form.find(DEFAULTS.incorrectFields);

    return !incorrectFields.length && this.$form.hasClass(DEFAULTS.formIsValid);
  }

  /**
   * Validates an email
   *
   * @static
   * @param {String} email
   * @return {Boolean}
   */
  static validateEmail (email) {
    const pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

    return pattern.test(email);
  }

  /**
   * Remove incorrect state from all fields
   *
   * @return {Validator}
   */
  removeIncorrectState () {
    this.$form
      .find(this.options.fieldsSelector).removeClass(this.DEFAULTS.incorrect);

    return this;
  }

  /**
   * Reset form to default state
   *
   * @return {Validator}
   */
  resetForm () {
    this.$form[0].reset();

    return this;
  }

  /**
   * Remove incorrect state from all fields when modal is closed
   *
   * @return {Validator}
   */
  removeIncorrectStateOnModalClose () {
    this.ELEMENTS.modal().on('hidden.bs.modal', () => this.removeIncorrectState());

    return this;
  }

  /**
   * Remove incorrect state form all fields when clicked outside the form
   *
   * @return {Validator}
   */
  removeIncorrectStateOnFocusOut () {
    $('body').on('click tap', (e) => {
      const clickedOnForm = $(e.target).closest(this.$form).length > 0;

      if (!clickedOnForm) this.removeIncorrectState();
    });

    return this;
  }

  /**
   * Set incorrect state on field
   *
   * @param {jQuery} field
   * @param {String} errorText - displayed error text
   */
  throwError (field, errorText) {
    const DEFAULTS = this.DEFAULTS;

    field.addClass(DEFAULTS.incorrect)
      .find(DEFAULTS.error).text(errorText);
  }

  /**
   * Check field for validness and set valid/incorrect state
   *
   * @param {jQuery} field
   * @param {Number} valueLength
   * @param {String} errorText
   * @param {Boolean} condition - condition to set valid state
   */
  checkFieldValidness (field, condition, errorText, valueLength) {
    const DEFAULTS = this.DEFAULTS;
    const dataText = field.data(DEFAULTS.textDataName);

    if (dataText && dataText.length) errorText = dataText;

    if (!valueLength) {
      this.throwError(field, DEFAULTS.emptyField);
    } else if (!condition) {
      this.throwError(field, errorText);
    } else {
      this.$form.addClass(DEFAULTS.formIsValid);
    }
  }

  /**
   * Validates field
   *
   * @param {jQuery} field
   */
  validateField (field) {
    const DEFAULTS = this.DEFAULTS;
    const type = field.data(DEFAULTS.dataType);

    let fieldParams = {
      condition: true,
      errorText: DEFAULTS.emptyField,
      length: 1
    };

    switch (type) {
      // data-validation-type="text"
      case DEFAULTS.textType: {
        fieldParams = this.validateTextField(field);
        break;
      }

      // data-validation-type="phone"
      case DEFAULTS.phoneType: {
        fieldParams = this.validateTextField(field);
        fieldParams.errorText = DEFAULTS.incorrectPhone;
        break;
      }

      // data-validation-type="email"
      case DEFAULTS.emailType: {
        fieldParams = this.validateEmailField(field);
        fieldParams.errorText = DEFAULTS.incorrectEmail;
        break;
      }

      // data-validation-type="radio"
      case DEFAULTS.radioType: {
        fieldParams.condition = this.validateRadioField(field);
        break;
      }

      // data-validation-type="select"
      case DEFAULTS.selectType: {
        fieldParams = this.validateSelectField(field);
        fieldParams.errorText = DEFAULTS.incorrectSelect;
        break;
      }
    }

    this.checkFieldValidness(field, fieldParams.condition, fieldParams.errorText, fieldParams.length);
  }

  /**
   * Validate 'Text' field
   *
   * @param {jQuery} field
   * @return {Object}
   */
  validateTextField (field) {
    const DEFAULTS = this.DEFAULTS;
    const input = field.find('input').length ? field.find('input') : field.find('textarea');
    const value = input.val();
    const valueLength = value.length;
    const conditionType = input.data(DEFAULTS.dataCondition);

    let condition, errorText;

    switch (conditionType) {
      // data-validation-condition="length"
      case DEFAULTS.length: {
        const length = input.data('length');
        const maxLength = input.data('max-length');
        const minLength = input.data('min-length');

        if (length) {
          condition = valueLength === parseInt(length, 10);
          errorText = 'Необходимая длинна поля - ' + length + ' символов';
          break;
        }

        const maxLengthCondition = valueLength <= parseInt(maxLength, 10);
        const minLengthCondition = valueLength >= parseInt(minLength, 10);

        if (maxLength && minLength) {
          condition = maxLengthCondition && minLengthCondition;
          errorText = 'Кол-во символов должно быть не более ' + maxLength + ' и не менее ' + minLength;
        } else if (maxLength) {
          condition = maxLengthCondition;
          errorText = 'Максимальная длинна поля - ' + maxLength + ' символов';
        } else if (minLength) {
          condition = minLengthCondition;
          errorText = 'Минимальная длинна поля - ' + minLength + ' символов';
        }

        break;
      }

      // data-validation-condition="equal"
      case DEFAULTS.equal: {
        const neededValue = input.data(DEFAULTS.equal);

        condition = value === neededValue;
        errorText = 'Значение поля не совпало с ожидаемым';

        break;
      }
    }

    return {
      condition,
      errorText,
      length: valueLength
    };
  }

  /**
   * Validate 'Email' field
   *
   * @param {jQuery} field
   */
  validateEmailField (field) {
    const value = field.find('input').val();
    const condition = Validator.validateEmail(value);
    const valueLength = value.length;

    return {
      condition,
      length: valueLength
    };
  }

  /**
   * Validate 'Radio' field
   *
   * @param {jQuery} field
   */
  validateRadioField (field) {
    const checkedVisibleRadio = field.find('input[type="radio"]:checked:visible');

    return checkedVisibleRadio.length >= 1;
  }

  /**
   * Validate 'Select' field
   *
   * @param {jQuery} field
   */
  validateSelectField (field) {
    const value = field.find('select').val();
    const condition = value && value != 0;

    return {
      condition,
      length: 1
    };
  }

  /**
   * Serialize form
   *
   * @return {Array} serialized form data
   */
  serializedFormData () {
    return this.$form.serialize();
  }

  /**
   * Send data if form is valid
   *
   * @param {Object|Function} options - ajax options
   * @return {Validator}
   */
  sendIfValidated (options = this.ajaxOptions) {
    const _this = this;

    async function callAjaxWithOptions() {
      if (typeof options === 'function') options = await options(_this);

      $.ajax(options);
    }

    if (this.formIsValid()) callAjaxWithOptions();

    return this;
  }

  /**
   * Validate form fields
   *
   * @return {Validator}
   */
  validateAllFields () {
    this.ELEMENTS.fields().each((index, field) => {
      const $field = $(field);
      const requiredToValidate = $field.data('validation') === this.DEFAULTS.requiredToValidate;

      if (requiredToValidate) this.validateField($field);
    });

    return this;
  }

  /**
   * Validate form
   *
   * @return {Validator}
   */
  runFormValidation () {
    this.removeIncorrectState()
      .validateAllFields()
      .sendIfValidated();

    return this;
  }

  /**
   * Initialize on-click validation
   *
   * @return {Validator}
   */
  bindOnClickValidation () {
    this.ELEMENTS.button().on('click.validation tap.validation', (e) => {
      e.preventDefault();

      this.runFormValidation();
    });

    return this;
  }

  /**
   * Unbind on-click event
   *
   * @return {Validator}
   */
  unbindOnClick () {
    this.ELEMENTS.button().unbind('click.validation tap.validation');

    return this;
  }

  /**
   * Initialize all validation scripts
   *
   * @return {Validator}
   */
  init () {
    this.bindOnClickValidation();

    // 'modal' options is true
    if (this.options.modal) this.removeIncorrectStateOnModalClose();

    // 'removeOnFocusOut' is true
    if (this.options.removeOnFocusOut) this.removeIncorrectStateOnFocusOut();

    return this;
  }
}
