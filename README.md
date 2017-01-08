# Validator

This module is to validate HTML forms. Text fields, emails, phones, checkobxes etc.

## Installation

Install validator module

```
npm i -save html-form-validation
```

Add validator to your project

```javascript
require(['html-form-validation', function (Validator) {});
```

or

```javascript
import Validator from 'html-form-validation';
```

or

```html
<script src="html-form-validation.js"></script>
```

Also, include CSS file (src/css/html-form-validation.css)

```html
<link href="html-form-validation.css" rel="stylesheet">
```

## Usage

Validator module needs proper HTML-markup (more in example section)

```html
<form>
  <!--Email field-->
  <label class="form-input" data-validation="required" data-validation-type="email">
    <input type="email">
    <div class="error"></div>
  </label>

  <!--Text field. With min and max length (can be only 'min' or only 'max')-->
  <label class="form-input" data-validation="required" data-validation-type="text">
    <textarea data-validation-condition="length" data-min-length="50" data-max-length="200"></textarea>
    <div class="error"></div>
  </label>

  <!--Text field. With custom error message, 'equal' codition-->
  <label class="form-input" data-validation="required" data-validation-type="text" data-validation-text="Incorrect data">
    <input type="text" data-validation-condition="equal" data-equal="dataToCompare">
    <div class="error"></div>
  </label>

  <!--Validate form button-->
  <button class="validate-form-button" type="submit">Validate form</button>
</form>
```

Initialize validator module

```javascript
/**
 * First param. Form to validate.
 *
 * @type {jQuery|HTMLElement|String}
 */
var param1 = $('form');

/**
 * Second param. Params for AJAX request performed when form is valid.
 *
 * @type {Function|Object}
 */
var param2 = function (context) {
  console.log('%csuccess! Context:\n%o', 'color: blue;', context);

  // function should return Object with AJAX params.
  return {
    url: 'ajax/example.json',
    method: 'get',
    success: () => console.log('ajax success callback')
  }
};

/**
 * Third param. User-specified options. Unnecessary.
 *
 * @type {Object}
 */
var param3 = {
  // If form is situated in bootstrap modal (login form etc.),
  // incorrect field state will be removed when modal is closed.
  // DEFAULT: false
  modal: false,
  // Selector to find form's fields.
  // When changing, you should also change CSS styles.
  // DEFAULT: '.form-input'.
  fieldsSelector: '.form-input',
  // Remove fields incorrect state, when clicked outside the form.
  // DEFAULT: false.
  removeOnFocusOut: true
};

/** Initialize Validator */
new Validator(param1, param2, param3);
```

Ajax options function can perform async actions before returning ajax options object (only ES7 version).

```javascript
const param2 = context => {
  // function should return Promise
  return new Promise((resolve, reject) => {
    // perform async actions. main ajax request will be performed on promise resolve
    $.ajax({
      url: 'path/to/async/action',
      method: 'get',
      // remember, function must return options for AJAX request
      success: res => resolve({
        url: 'path/to/main/ajax',
        method: 'post',
        success: res => console.log('main AJAX success %o', res)
      }),
      error: xhr => reject(xhr)
    });
  })
};
```

## Options (form fields)

| Option name     | Possible values | Description |
| --------------- |:-------------:| :-----|
| data-validation | **required** / **false** | Validates the field when set to true. |
| data-validation-type | **text** / **phone** / **email** / **checkbox** / **radio** / **select** | Which method used to validate field. Each type has its own. |
| data-validation-text | **any string** | Text used as error message. Otherwise validator will use its own messages for every field type. |

## Field types

| Type | Description | Available input types |
| --- | ----- | ---- |
| text | Validates text field. Input can have additional attribute **_data-validation-condition_** with available **length** and **equal** values. If set to **length** - Validator will look for **_data-min-length_**, **_data-max-length_** or **_data-length_** attributes. If set to **equal** - Validator will look for **_data-equal_** attribute. Then validator will match value with values from attributes.| input / textarea |
| phone | Under development. No additional options are available. | input |
| email | Validates email field. No additional options are available. | input |
| checkbox | At least one checkbox in field should be checked and visible. No additional options are available. | input[type="checkbox"] |
| radio | At lease one radio should be selected. No additional options are available. | input[type="radio"] |
| select | Checks for selected option. Its value should not equal **_0_** or **_false_**. No additional options are available. | select |

## Tests (not ready yet)

Run tests

```
npm run-script runTest
```

## Versioning

Current version is 0.1.2

## Authors

* **Shapovalov Vitali**
