# Validator

This module is to validate HTML forms. Text fields, emails, phones, checkobxes etc. Check out [demo](https://vitalishapovalov.github.io/html-form-validation/).

## Overview

* [Installation](#installation)
* [Usage](#usage)
    * [Markup](#markup)
    * [Initialization](#default-initialization)
    * [Initialization with webpack](#initialization-with-webpack)
* [Options (html)](#options-html)
    * [Form fields](#form-fields)
    * [Field types](#field-types)
* [Options (js)](#options-js)
* [Methods](#methods)
    * [Instance method](#instance-method)
    * [Static methods](#static-methods)
* [TODO](#todo)
* [Requirement](#requirement)
* [Versioning](#versioning)

## Installation

Install validator module

```
npm i -S html-form-validation
```

or with yarn

```
yarn add html-form-validation
```

Add validator to your project

AMD

```javascript
require(['html-form-validation'], function (Validator) {});
```

CommonJS

```javascript
var Validator = require('html-form-validation');
```

ES6

```javascript
import Validator from 'html-form-validation';
```

Inline

```html
<script src="html-form-validation.js"></script>
```

Also, include CSS file

```html
<link href="validator.css" rel="stylesheet">
```

## Usage

### Markup

Validator module needs proper HTML-markup (more in example section)

```html
<form>
  <!-- Email field -->
  <label class="form-input" data-validation="required" data-validation-type="email">
    <input type="email">
    <div class="error"></div>
  </label>

  <!-- Text field. With min and max length -->
  <label class="form-input" data-validation="required" data-validation-type="text">
    <textarea data-validation-condition="length" data-min-length="50" data-max-length="200"></textarea>
    <div class="error"></div>
  </label>

  <!-- Text field. With custom error message, 'equal' codition -->
  <label class="form-input" data-validation="required" data-validation-type="text" data-validation-text="Incorrect data">
    <input type="text" data-validation-condition="equal" data-equal="dataToCompare">
    <div class="error"></div>
  </label>

  <!-- Validate form button -->
  <button class="validate-form-button" type="submit">Validate form</button>
</form>
```

### Default initialization

```javascript
// initialize
$('form').validator();

// initialize with options
$('form').validator({
  removeErrorOnFocusOut: true
});
```

### Initialization with webpack

```javascript
// import validator
import Validator from 'html-form-validation';

// fix jQuery conflict
Validator.expose($);

// use it
$('form').validator();
```

## Options (html)

### Form fields

| Option name     | Possible values | Description |
| --------------- |:-------------:| :-----|
| data-validation | **required** / **false** | Validates the field when set to true. |
| data-validation-type | **text** / **phone** / **email** / **checkbox** / **radio** / **select** | Which method used to validate field. Each type has its own. |
| data-validation-text | **any string** | Text used as error message. Otherwise validator will use its own messages for every field type. |

### Field types

| Type | Description | Available input types |
| --- | ----- | ---- |
| text | Validates text field. Input can have additional attribute **_data-validation-condition_** with available **length** and **equal** values. If set to **length** - Validator will look for **_data-min-length_**, **_data-max-length_** or **_data-length_** attributes. If set to **equal** - Validator will look for **_data-equal_** attribute. Then validator will match value with values from attributes.| input / textarea |
| phone | Under development. No additional options are available. | input |
| email | Validates email field. No additional options are available. | input |
| checkbox | At least one checkbox in field should be checked and visible. No additional options are available. | input[type="checkbox"] |
| radio | At lease one radio should be selected. No additional options are available. | input[type="radio"] |
| select | Checks for selected option. Its value should not equal **_0_** or **_false_**. No additional options are available. | select |

## Options (js)

### ajax

Type: `Object`

Default: `{}`

AJAX options. If set - request will be performed after validation (if form is valid).

### lang

Type: `String`

Default: `en`

Error text language (en/ru).

### removeErrorOnFocusOut

Type: `Boolean`

Default: `false`

When true, remove fields incorrect state when clicked outside the form.

### fieldsSelector

Type: `String`

Default: `'.form-input'`

Form fields selector string.

### beforeValidation

Type: `Function`

Default: `null`

Parameter: `validator`

Example:
```javascript
$('form').validator({
  beforeValidation: function (validator) {
    console.log('performed before validation');
  }
});
```

Callback performed before form validation.

### afterValidation

Type: `Function`

Default: `null`

Parameter: `validator`

Callback performed after form validation.

### onValid

Type: `Function`

Default: `null`

Parameter: `validator`

Callback performed after validation, if form is valid (before AJAX).

## Methods

### Instance method

```javascript
// initialize and get access to validator's instance
// (if inited on multiple jQuery objects returns an array of instances)
var validatorInstance = $('form').validator();

// run form validation
validatorInstance.runFormValidation();

// reset form
validatorInstance.resetForm();

// get serialized data
var formData = validatorInstance.serializedFormData();

// unbind validation from button
validatorInstance.unbindOnClick();
```

### Static methods

```javascript
/**
 * Expose validator module as jquery plugin.
 * Use before initialazing validator.
 * (fixes jquery conflict when using webpack's "import")
 *
 * @static
 * @param {jQuery} jQuery
 */
 Validator.expose($);
```

## TODO

* Alphabet / numeric characters validation
* Correct phone number validation
* Simplify data-attr logic
* Refactor errors text / languages
* Add 'afterChange' validation

## Requirement

[jQuery 1.9.1+](http://jquery.com/)

## Versioning

Current version is 0.2.2