'use strict';

const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

const isProduction = process.env.NODE_ENV == 'production' ? true : false;

const production = {
  cache: true,
  mode: 'production',
  devtool: 'source-map',
  target: 'web',
  entry: {
    umd: {
      import: path.resolve(__dirname, './src/index.ts'),
      library: {
        name: 'SmartChartsNXT',
        type: 'umd',
        export: 'default',
        umdNamedDefine: true
      }
    },
    cjs: {
      import: path.resolve(__dirname, './src/index.ts'),
      library: {
        name: 'SmartChartsNXT',
        type: 'commonjs',
        export: 'default'
      }
    },
    amd: {
      import: path.resolve(__dirname, './src/index.ts'),
      library: {
        name: 'SmartChartsNXT',
        type: 'amd',
        export: 'default'
      }
    }
  },
  output: {
    filename: (pathData) => {
      return pathData.chunk.name === 'umd' ? 'smartchartsnxt.js' : 'smartchartsnxt.[name].js';
    },
    path: path.resolve('__dirname' + './dist'),
    globalObject: 'this'
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.tsx', '.ts']
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 1000000,
    maxAssetSize: 1000000
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: path.resolve(__dirname, './bundle-analyser/bundle-analysis.html'),
      openAnalyzer: false
    }),
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
            '@babel/preset-typescript',
            ['@babel/preset-env', {
              'useBuiltIns': 'usage',
              'corejs': 3,
              'debug': true,
              'targets': {
                'browsers': ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'not dead']
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
    usedExports: false,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          warnings: false,
          parse: {},
          compress: {
            booleans_as_integers: true,
            drop_console: true,
            drop_debugger: true,
            side_effects: false,
            warnings: true,
            passes: 3
          },
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ]
  }
};

const development = {
  cache: true,
  mode: 'development',
  target: 'web',
  devtool: 'source-map',
  entry: {
    umd: {
      import: path.resolve(__dirname, './src/index.ts'),
      library: {
        name: 'SmartChartsNXT',
        type: 'umd',
        export: 'default',
        umdNamedDefine: true
      }
    }
  },
  output: {
    filename: (pathData) => {
      return pathData.chunk.name === 'umd' ? 'smartchartsnxt.js' : 'smartchartsnxt.[name].js';
    },
    path: path.resolve('__dirname' + './dist'),
    globalObject: 'this'
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.tsx', '.ts']
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 1000000,
    maxAssetSize: 1000000
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: path.resolve(__dirname, './bundle-analyser/bundle-analysis.html'),
      openAnalyzer: false
    }),
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
          presets: ['@babel/preset-typescript']
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