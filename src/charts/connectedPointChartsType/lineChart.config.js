/**
 * lineChart.config.js
 * @createdOn:14-May-2020
 * @author:SmartChartsNXT
 * @description:This will be the default Line chart config for load in BaseChart.
 */

import { CHART_TYPE } from '../../settings/globalEnums';

export const config = {
  name: 'Line Chart',
  type: CHART_TYPE.LINE_CHART,
  minWidth: 250,
  minHeight: 400
};

export const validationRules = {
  dataSet: {
    isRequired: true,
    type: ['object'],
    values: '*',
    requiredErrMsg: 'Missing required field option.dataSet !',
    typeErrMsg: 'Invalid type in option.dataSet ! Should be typeof object',
    valuesErrMsg:'',
    rules: {
      series: {
        isRequired: true,
        type: ['array'],
        values: {
          name: {
            isRequired: true,
            type: ['string'],
            values: '*',
            requiredErrMsg: 'Required field option.dataSet.series[[l1]].name is missing or blank string !',
            typeErrMsg: 'Invalid type in option.dataSet.series[[l1]].name ! Should be typeof string',
            valuesErrMsg:''
          },
          data: {
            isRequired: true,
            type: ['array'],
            values: {
              label:{
                isRequired: true,
                type: ['string', 'number'],
                values: '*',
                requiredErrMsg: 'Required field option.dataSet.series[[l1]].data[[l2]].label is missing or blank string !',
                typeErrMsg: 'Invalid type in option.dataSet.series[[l1]].data[[l2]].label ! Should be typeof string',
                valuesErrMsg:''
              },
              value:{
                isRequired: true,
                type: ['string', 'number'],
                values: '*',
                requiredErrMsg: 'Required field option.dataSet.series[[l1]].data[[l2]].value is missing or blank string !',
                typeErrMsg: 'Invalid type in option.dataSet.series[[l1]].data[[l2]].value ! Should be typeof string',
                valuesErrMsg:''
              }
            },
            requiredErrMsg: 'Required field option.dataSet.series[[l1]].data is missing or blank string !',
            typeErrMsg: 'Invalid type in option.dataSet.series[[l1]].data ! Should be typeof array',
            valuesErrMsg:''
          }
        },
        requiredErrMsg: 'Missing required field option.dataSet.series !',
        typeErrMsg: 'Invalid type in option.dataSet.series ! Should be typeof array',
        valuesErrMsg:''
      }
    }
  }
};