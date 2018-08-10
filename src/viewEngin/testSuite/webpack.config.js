"use strict";

const path = require("path");
const webpack = require("webpack");

module.exports = {
  module: {
    loaders: [{
      loader: "babel-loader",
      exclude: path.resolve(__dirname, "./../../../node_modules"),
      query: {
        plugins: [
          ['@babel/plugin-transform-runtime',{
            "helpers": true,
            "polyfill": true,
            "regenerator": false,
            "moduleName": "@babel/runtime"
          }],
          ['@babel/plugin-proposal-class-properties'],
          ['@babel/plugin-proposal-object-rest-spread'],
          ['@babel/plugin-transform-react-jsx', {"pragma": "__h__"}] // change default pragma React.createElement into __h__
        ],
        presets: ['@babel/preset-env']
      }
    }]
  }
};