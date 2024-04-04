'use strict';

/**
 * validator.ts
 * @createdOn:06-Oct-2019
 * @author:SmartChartsNXT
 * @description: Generic Validation will validate options based on rule set.
 */

export class Validator {
  constructor() { }

  validate(rules: any, opts: any, label: number = 1) {
    const labelEx = new RegExp('\\[\\[l' + label + '\\]\\]', 'gi');
    let errors = [];
    for (let prop in rules) {
      const rule = rules[prop];
      if (rule.isRequired && (!opts.hasOwnProperty(prop) || JSON.stringify(opts[prop]) === undefined || opts[prop] === '')) {
        errors.push(new CError(rule.requiredErrMsg));
      } else {
        if ((!Array.isArray(opts[prop]) && rule.type.indexOf(typeof opts[prop]) === -1) || (Array.isArray(opts[prop]) && rule.type.indexOf('array') === -1)) {
          if (opts[prop] === null && rule.type.indexOf('null') === -1) {
            errors.push(new CError(rule.typeErrMsg));
          } else if (opts[prop] !== null) {
            errors.push(new CError(rule.typeErrMsg));
          }
        } else if (rule.type.indexOf('object') > -1 && rule.hasOwnProperty('rules')) {
          errors.push.apply(errors, this.validate(rule['rules'], opts[prop], label));
        } else if (rule.type.indexOf('array') > -1) {
          for (let i = 0; i < opts[prop].length; i++) {
            const valueRules = JSON.parse(JSON.stringify(rule['values']).replace(labelEx, '\[' + i + '\]'));
            if (valueRules != '*') {
              errors.push.apply(errors, this.validate(valueRules, opts[prop][i], label + 1));
            }
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

export class CError extends Error {
  public module: string;
  constructor(...params: any[]) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CError);
    }
    this.module = '[SmartChartsNXT] ';
  }
}