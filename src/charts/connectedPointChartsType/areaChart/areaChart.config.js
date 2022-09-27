/**
 * areaChart.config.js
 * @createdOn:12-Dec-2017
 * @author:SmartChartsNXT
 * @description:This will be the default Area chart config and validation rule set.
 */

import { CHART_TYPE } from '../../../settings/globalEnums';
const chartTypes = new CHART_TYPE();

export const config = {
  name: 'Area Chart',
  type: chartTypes.AREA_CHART,
  minWidth: 250,
  minHeight: 400
};

export const validationRules = {
  dataSet: {
    isRequired: true,
    type: ['object'],
    values: '*',
    requiredErrMsg: 'Missing required field option.dataSet !',
    typeErrMsg: 'Invalid type in option.dataSet ! Should be typeof Object',
    valuesErrMsg: '',
    rules: {
      series: {
        isRequired: true,
        type: ['array'],
        values: {
          name: {
            isRequired: true,
            type: ['string'],
            values: '*',
            requiredErrMsg: 'Required field option.dataSet.series[[l1]].name is missing or blank String !',
            typeErrMsg: 'Invalid type in option.dataSet.series[[l1]].name ! Should be typeof String',
            valuesErrMsg: ''
          },
          data: {
            isRequired: true,
            type: ['array'],
            values: '*',
            // {
            //   label:{
            //     isRequired: true,
            //     type: ['string', 'number'],
            //     values: '*',
            //     requiredErrMsg: 'Required field option.dataSet.series[[l1]].data[[l2]].label is missing or blank String !',
            //     typeErrMsg: 'Invalid type in option.dataSet.series[[l1]].data[[l2]].label ! Should be typeof String or Number',
            //     valuesErrMsg:''
            //   },
            //   value:{
            //     isRequired: true,
            //     type: ['string', 'number', 'null'],
            //     values: '*',
            //     requiredErrMsg: 'Required field option.dataSet.series[[l1]].data[[l2]].value is missing or blank string !',
            //     typeErrMsg: 'Invalid type in option.dataSet.series[[l1]].data[[l2]].value ! Should be typeof String, Number or null',
            //     valuesErrMsg:''
            //   }
            // },
            requiredErrMsg: 'Required field option.dataSet.series[[l1]].data is missing or blank String !',
            typeErrMsg: 'Invalid type in option.dataSet.series[[l1]].data ! Should be typeof Array',
            valuesErrMsg: ''
          }
        },
        requiredErrMsg: 'Missing required field option.dataSet.series !',
        typeErrMsg: 'Invalid type in option.dataSet.series ! Should be typeof Array',
        valuesErrMsg: ''
      }
    }
  }
};