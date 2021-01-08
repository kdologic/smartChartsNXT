'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  module: {
    rules: [{
      exclude: path.resolve(__dirname, './../../../node_modules'),
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [
            ['@babel/plugin-proposal-class-properties'],
            ['@babel/plugin-proposal-object-rest-spread'],
            ['@babel/plugin-transform-react-jsx', {
              'pragma': '__h__'
            }]
          ],
          presets: []
        }
      }
    }, {
      test: /\.css$/,
      use: [{ loader: 'to-string-loader' }, { loader: 'css-loader' }]
    }]
  },
  optimization: {
    minimize: false
  }
};