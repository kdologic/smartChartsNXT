"use strict";

const path = require("path");
const webpack = require("webpack");
//let Visualizer = require('webpack-visualizer-plugin');
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
  plugins: [
    //new Visualizer({filename: './public/statistics.html'}),
    new BundleAnalyzerPlugin()
  ],
  module: {
    loaders: [{
      loader: "babel-loader",
      exclude: /(node_modules)/,
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