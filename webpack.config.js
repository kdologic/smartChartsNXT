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
      exclude: [
        path.resolve(__dirname, "node_modules")
      ],
      query: {
        plugins: [
          ['transform-runtime'],
          ["transform-class-properties"],
          ['transform-object-rest-spread'],
          ["transform-react-jsx", {"pragma": "__h__"}] // change default pragma React.createElement into __h__
        ],
        presets: ['es2015']
      }
    }]
  }
};