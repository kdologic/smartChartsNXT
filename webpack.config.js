'use strict';

const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const isProduction = process.env.NODE_ENV == 'production' ? true : false;

const production = {
  cache: true,
  mode: 'production',
  entry:{
    ['smartChartsNXT.main']: path.resolve(__dirname, './src/index.js'),
    ['smartChartsNXT.ieSupport']: path.resolve(__dirname, './src/ieSupport/index.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve('__dirname' + './build')
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(isProduction)
    })
  ],
  module: {
    rules: [{
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [
            ['@babel/plugin-proposal-class-properties'],
            ['@babel/plugin-proposal-object-rest-spread'],
            ['@babel/plugin-transform-runtime', {
              'helpers': true,
              'useESModules': true,
              'regenerator': true
            }],
            ['@babel/plugin-transform-react-jsx', {
              'pragma': '__h__'
            }] // change default pragma React.createElement into __h__
          ],
          presets: [
            ['@babel/preset-env', {
              'useBuiltIns': 'usage',
              'corejs': 3,
              'debug': true,
              'targets': {
                'browsers': ['> 1% and not dead']
              }
            }]
          ]
        }
      }
    }, {
      test: /\.css$/,
      use: [{ loader: 'to-string-loader' }, { loader: 'css-loader' }]
    }]
  },
  optimization: {
    minimize: false,
    usedExports: true
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

const development = {
  cache: true,
  mode: 'production',
  devtool: undefined,
  entry:{
    ['smartChartsNXT.main']: path.resolve(__dirname, './src/index.js'),
    ['smartChartsNXT.ieSupport']: path.resolve(__dirname, './src/ieSupport/index.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve('__dirname' + './build')
  },
  plugins: [
    new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(isProduction)
    })
  ],
  module: {
    rules: [{
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [
            ['@babel/plugin-proposal-class-properties'],
            ['@babel/plugin-proposal-object-rest-spread'],
            ['@babel/plugin-transform-react-jsx', {
              'pragma': '__h__'
            }] // change default pragma React.createElement into __h__
          ],
          presets: [{}]
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

module.exports = isProduction ? production : development;