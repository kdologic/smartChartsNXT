"use strict";

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isProduction = process.env.NODE_ENV == "production" ? true : false; 

console.log(process.env.NODE_ENV,isProduction);

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: !isProduction ? 'eval' : undefined,
  plugins: [
    //new BundleAnalyzerPlugin(),
  ],
  module: {
    rules: [{
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
        options: {
          plugins: [
            ['@babel/plugin-proposal-class-properties'],
            ['@babel/plugin-proposal-object-rest-spread'],
            // ["@babel/plugin-transform-runtime", { // creating error after minification
            //   "corejs": 2,
            //   "helpers": true,
            //   "regenerator": true,
            //   "useESModules": false
            // }],
            ['@babel/plugin-transform-react-jsx', {
              "pragma": "__h__"
            }] // change default pragma React.createElement into __h__
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
    // minimizer: [
    //   new UglifyJsPlugin({
    //     parallel: 4,
    //     uglifyOptions: {
    //       warnings: false,
    //       parse: {},
    //       compress: {},
    //       mangle: true, // Note `mangle.properties` is `false` by default.
    //       output: null,
    //       toplevel: false,
    //       nameCache: null,
    //       ie8: false,
    //       keep_fnames: true
    //     }
    //   })
    // ]
  }
};