'use strict';

const argv = require('yargs').argv;

process.env.NODE_ENV = argv.env == 'production' ? 'production' : 'development';

const { src, dest, series, watch } = require('gulp');
const insert = require('gulp-insert');

const minify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');

const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

const pkg = require('./package.json');
const srcDir = './src/';
const buildDir = './build/';
const testDir = './test/';

const header = `/**
* SmartChartsNXT
* http://www.smartcharts.cf
* Version:${pkg.version}
*
* Copyright 2019 Kausik Dey
* Released under the MIT license
* https://github.com/kausikongit/smartChartsNXT/blob/develop/LICENSE
*/
`;

/*
 * Generate a build based on the source file
 */

function buildJSTask() {
  return src(srcDir)
    .pipe(webpack(webpackConfig))
    //.pipe(rename('smartChartsNXT.bundle.js'))
    //.pipe(insert.prepend(header))
    .pipe(dest(buildDir));
}

function minifyTask() {
  return src(buildDir + 'smartChartsNXT.bundle.js')
    .pipe(minify({
      'keep_classnames': true,
      'keep_fnames': true
    }))
    .pipe(rename('smartChartsNXT.bundle.min.js'))
    .pipe(insert.prepend(header))
    .pipe(dest(buildDir));
}

function watchTask() {
  return watch('./src/**', { events: 'all' }, series(buildJSTask));
}

exports.minify = minifyTask;
exports.watch = watchTask;
exports.buildJS = buildJSTask;
exports.build = series(buildJSTask, minifyTask);
exports.default = series(buildJSTask, watchTask);