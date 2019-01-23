"use strict";

const path = require("path");
const webpack = require("webpack");

module.exports = {
  module: {
    rules: [{
      exclude: path.resolve(__dirname, "./../../../node_modules"),
      use: {
        loader: "babel-loader",
        options: {
          plugins: [
            ['@babel/plugin-proposal-class-properties'],
            ['@babel/plugin-proposal-object-rest-spread'],
            ['@babel/plugin-transform-react-jsx', {
              "pragma": "__h__"
            }]
          ],
          presets: [
            ['@babel/preset-env', {
              "useBuiltIns": 'entry',
              "targets": {
                "browsers": ["last 2 versions", "> 1%", "safari > 8", "not ie < 11", "not dead"]
              }
            }]
          ]
        }
      }
    }]
  },
  optimization: {
    minimize: false
  }
};