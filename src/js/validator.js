/**
 * @name form-validation.js
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

;(function ($) {

  /**
   * Validator module
   *
   * @constructor
   *
   * @param {HTMLElement|jQuery} form - form to validate
   * @param {Function|Object} ajaxOptions - function that should return AJAX request options
   * @param {Object} [options] - user specified options
   * @param {Boolean} [options.nestedInModal=false] - when true, remove fields incorrect state on modal hide
   * @param {String} [options.fieldsSelector='.form-input'] - form's field selector string
   * @param {Boolean} [options.removeOnFocusOut=false] - when true, remove fields incorrect state when clicked outside the form
   */
  function Validator(form, ajaxOptions, options) {

    ajaxOptions = ajaxOptions || {};
    options = options || {};

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

    /** Initialize */
    this.init();
  }

  /**
   * Default options
   *
   * @type {Object}
   * @protected
   */
  var DEFAULTS = {
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
    length: 'length',
    equal: 'equal',

    // 'data-validation=' VALUE TYPES
    requiredToValidate: 'required'
  };

  /**
   * DOM elements (dynamically selected)
   *
   * @protected
   */
  Validator.prototype.ELEMENTS = function () {
    var _this = this;
    var $form = _this.$form;

    return {
      modal: function () {
        return $form.parents('.modal');
      },
      button: function () {
        return $form.find('.validate-form-button');
      },
      inputs: function () {
        return _this.$form.find('input, textarea, select');
      },
      fields: function () {
        return _this.$form.find(_this.options.fieldsSelector);
      }
    };
  };

  /**
   * Buffer object
   *
   * @public
   */
  Validator.prototype.buffer = {};

  /**
   * Check form for validness
   *
   * @return {Boolean}
   */
  Validator.prototype.formIsValid = function () {
    var incorrectFields = this.$form.find(DEFAULTS.incorrectFields);

    return !incorrectFields.length && this.$form.hasClass(DEFAULTS.formIsValid);
  };

  /**
   * Validates an email
   *
   * @static
   * @param {String} email
   * @return {Boolean}
   */
  Validator.validateEmail = function (email) {
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

    return pattern.test(email);
  };

  /**
   * Remove incorrect state from all fields
   *
   * @return {Validator}
   */
  Validator.prototype.removeIncorrectState = function () {
    this.$form
      .find(this.options.fieldsSelector).removeClass(DEFAULTS.incorrect);

    return this;
  };

  /**
   * Reset form to default state
   *
   * @return {Validator}
   */
  Validator.prototype.resetForm = function () {
    this.$form[0].reset();

    return this;
  };

  /**
   * Remove incorrect state from all fields when modal is closed
   *
   * @return {Validator}
   */
  Validator.prototype.removeIncorrectStateOnModalClose = function () {
    var _this = this;

    _this.ELEMENTS().modal().on('hidden.bs.modal', function () {
      _this.removeIncorrectState();
    });

    return this;
  };

  /**
   * Remove incorrect state form all fields when clicked outside the form
   *
   * @return {Validator}
   */
  Validator.prototype.removeIncorrectStateOnFocusOut = function () {
    var _this = this;

    $('body').on('click tap', function (e) {
      var clickedOnForm = $(e.target).closest(_this.$form).length > 0;

      if (!clickedOnForm) _this.removeIncorrectState();
    });

    return this;
  };

  /**
   * Set incorrect state on field
   *
   * @param {jQuery} field
   * @param {String} errorText - displayed error text
   */
  Validator.prototype.throwError = function (field, errorText) {
    field.addClass(DEFAULTS.incorrect)
      .find(DEFAULTS.error).text(errorText);
  };

  /**
   * Check field for validness and set valid/incorrect state
   *
   * @param {jQuery} field
   * @param {Number} valueLength
   * @param {String} errorText
   * @param {Boolean} condition - condition to set valid state
   */
  Validator.prototype.checkFieldValidness = function (field, condition, errorText, valueLength) {
    var dataText = field.data(DEFAULTS.textDataName);

    if (dataText && dataText.length) errorText = dataText;

    if (!valueLength) {
      this.throwError(field, DEFAULTS.emptyField);
    } else if (!condition) {
      this.throwError(field, errorText);
    } else {
      this.$form.addClass(DEFAULTS.formIsValid);
    }
  };

  /**
   * Validates field
   *
   * @param {jQuery} field
   */
  Validator.prototype.validateField = function (field) {
    var type = field.data(DEFAULTS.dataType);
    var fieldParams = {
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
  };

  /**
   * Validate 'Text' field
   *
   * @param {jQuery} field
   * @return {Object}
   */
  Validator.prototype.validateTextField = function (field) {
    var input = field.find('input').length ? field.find('input') : field.find('textarea');
    var value = input.val();
    var valueLength = value.length;

    var conditionType = input.data(DEFAULTS.dataCondition);
    var condition, errorText;

    switch (conditionType) {
      // data-validation-condition="length"
      case DEFAULTS.length: {
        var length = input.data('length');
        var maxLength = input.data('max-length');
        var minLength = input.data('min-length');

        if (length) {
          condition = valueLength === parseInt(length, 10);
          errorText = 'Необходимая длинна поля - ' + length + ' символов';
          break;
        }

        var maxLengthCondition = valueLength <= parseInt(maxLength, 10);
        var minLengthCondition = valueLength >= parseInt(minLength, 10);

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
        var neededValue = input.data(DEFAULTS.equal);

        condition = value === neededValue;
        errorText = 'Значение поля не совпало с ожидаемым';

        break;
      }
    }

    return {
      condition: condition,
      errorText: errorText,
      length: valueLength
    };
  };

  /**
   * Validate 'Email' field
   *
   * @param {jQuery} field
   */
  Validator.prototype.validateEmailField = function (field) {
    var value = field.find('input').val();
    var condition = Validator.validateEmail(value);
    var valueLength = value.length;

    return {
      condition: condition,
      length: valueLength
    };
  };

  /**
   * Validate 'Radio' field
   *
   * @param {jQuery} field
   */
  Validator.prototype.validateRadioField = function (field) {
    var checkedVisibleRadio = field.find('input[type="radio"]:checked:visible');

    return checkedVisibleRadio.length >= 1;
  };

  /**
   * Validate 'Select' field
   *
   * @param {jQuery} field
   */
  Validator.prototype.validateSelectField = function (field) {
    var value = field.find('select').val();
    var condition = value && value != 0;

    return {
      condition: condition,
      length: 1
    };
  };

  /**
   * Serialize form
   *
   * @return {Array} serialized form data
   */
  Validator.prototype.serializedFormData = function () {
    return this.$form.serialize();
  };

  /**
   * Send data if form is valid
   *
   * @param {Object|Function} options - ajax options
   * @return {Validator}
   */
  Validator.prototype.sendIfValidated = function (options) {
    var _this = this;

    options = options || this.ajaxOptions;

    function callAjaxWithOptions() {
      if (typeof options === 'function') options = options(_this);

      $.ajax(options);
    }

    if (this.formIsValid()) callAjaxWithOptions();

    return this;
  };

  /**
   * Validate form fields
   *
   * @return {Validator}
   */
  Validator.prototype.validateAllFields = function () {
    var _this = this;

    _this.ELEMENTS().fields().each(function (index, field) {
      var $field = $(field);
      var requiredToValidate = $field.data('validation') === DEFAULTS.requiredToValidate;

      if (requiredToValidate) _this.validateField($field);
    });

    return this;
  };

  /**
   * Validate form
   *
   * @return {Validator}
   */
  Validator.prototype.runFormValidation = function () {
    this.removeIncorrectState()
      .validateAllFields()
      .sendIfValidated();

    return this;
  };

  /**
   * Initialize on-click validation
   *
   * @return {Validator}
   */
  Validator.prototype.bindOnClickValidation = function () {
    var _this = this;

    _this.ELEMENTS().button().on('click.validation tap.validation', function (e) {
      e.preventDefault();

      _this.runFormValidation();
    });

    return this;
  };

  /**
   * Unbind on-click event
   *
   * @return {Validator}
   */
  Validator.prototype.unbindOnClick = function () {
    this.ELEMENTS().button().unbind('click.validation tap.validation');

    return this;
  };

  /**
   * Initialize all validation scripts
   *
   * @return {Validator}
   */
  Validator.prototype.init = function () {
    this.bindOnClickValidation();

    // 'modal' options is true
    if (this.options.modal) this.removeIncorrectStateOnModalClose();

    // 'removeOnFocusOut' is true
    if (this.options.removeOnFocusOut) this.removeIncorrectStateOnFocusOut();

    return this;
  };

  /* expose Validator */
  if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS, just export
    module.exports = Validator;
  } else if (typeof define === 'function' && define.amd) {
    // AMD support
    define('Validator', function () { return Validator; });
  } else {
    // Global
    window.Validator = Validator;
  }

  /* expose Validator */
  $.fn.validator = function (ajaxOptions, options) {
    return this.each(function () {
      var $this = $(this);
      new Validator($this, ajaxOptions, options);
    });
  };

})(jQuery);
