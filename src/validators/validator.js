'use strict';

/**
 * validator.js
 * @createdOn:06-Oct-2019
 * @author:SmartChartsNXT
 * @description: Generic Validation will validate options based on rule set.
 */

class Validator {
  constructor() { }

  validate(rules, opts, label=1) {
    const labelEx = new RegExp('\\[\\[l'+label+'\\]\\]','gi');
    let errors = [];
    for (let prop in rules) {
      const rule = rules[prop];
      if (rule.isRequired && (!opts.hasOwnProperty(prop) || opts[prop].toString() === '')) {
        errors.push(new CError(rule.requiredErrMsg));
      } else {
        if ((!Array.isArray(opts[prop]) && rule.type.indexOf(typeof opts[prop]) === -1 )|| (Array.isArray(opts[prop]) && rule.type.indexOf('array') === -1)) {
          errors.push(new CError(rule.typeErrMsg));
        } else if (rule.type.indexOf('object') > -1 && rule.hasOwnProperty('rules')) {
          errors.push.apply(errors, this.validate(rule['rules'], opts[prop], label));
        } else if (rule.type.indexOf('array') > -1) {
          for (let i = 0; i < opts[prop].length; i++) {
            const valueRules = JSON.parse(JSON.stringify(rule['values']).replace(labelEx, '\['+i+'\]'));
            errors.push.apply(errors, this.validate(valueRules, opts[prop][i], label+1));
          }
        }
        if (rule.values !== '*' && Array.isArray(rule.values) && rule.values.indexOf(opts[prop]) === -1) {
          errors.push(new CError(rule.valuesErrMsg));
        }
      }
    }
    return errors;
  }
}

class CError extends Error {
  constructor(...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CError);
    }
    this.module = '[SmartChartsNXT] ';
  }
}

export default Validator;