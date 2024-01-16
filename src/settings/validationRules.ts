'use strict';

import { CHART_TYPE } from '../global/global.enums';

/**
 * validationRules.ts
 * @createdOn:06-Oct-2019
 * @author:SmartChartsNXT
 * @description: Validation rule set.
 */
export const validationRules = {
  type: {
    isRequired: true,
    type: ['string'],
    values: Object.values(CHART_TYPE),
    requiredErrMsg: 'Missing required field option.type !',
    typeErrMsg: 'Invalid type in option.type ! Should be typeof string',
    valuesErrMsg: `Invalid value in option.type ! Supported values are [${Object.values(CHART_TYPE).join(' | ')}]`
  },
  targetElem: {
    isRequired: true,
    type: ['string'],
    values: '*',
    requiredErrMsg: 'Required field option.targetElem is missing or blank string !',
    typeErrMsg: 'Invalid type in option.targetElem ! Should be typeof string',
    valuesErrMsg: ''
  }
};