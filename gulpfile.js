'use strict';

const argv = require('yargs').argv;
process.env.NODE_ENV = argv.env == 'production' ? 'production' : 'development';

const { src, dest, series, watch } = require('gulp');
const insert = require('gulp-insert');
const clean = require('gulp-clean');

const minify = require('gulp-terser');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

const pkg = require('./package.json');
const srcDir = './src/';
const buildDir = './build/';
const testDir = './test/';

let buildType = process.env.NODE_ENV == 'production' ? 'Production Build' : 'Developer Build';
buildType += ' - ' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' , hour:'numeric', minute:'numeric', second:'numeric'});

const header = `/**
* SmartChartsNXT
* http://www.smartcharts.cf
* Version:${pkg.version}
* ${buildType}
*
* Copyright 2020 Kausik Dey
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
    .pipe(replace('__version__', pkg.version))
    .pipe(insert.prepend(header))
    .pipe(dest(buildDir));
}

function minifyTask() {
  return src(buildDir + 'smartChartsNXT.main.bundle.js')
    .pipe(minify({
      'compress': {
        'booleans_as_integers': true,
        'drop_console': true,
        'drop_debugger': true,
        'side_effects': false,
        'warnings': true
      },
      'keep_classnames': true,
      'keep_fnames': true
    }))
    .pipe(rename('smartChartsNXT.main.bundle.min.js'))
    .pipe(insert.prepend(header))
    .pipe(dest(buildDir));
}

function cleanTask() {
  return src(buildDir, {read: false, allowEmpty: true})
    .pipe(clean());
}

function watchTask() {
  return watch('./src/**', { events: 'all' }, series(buildJSTask));
}

exports.clean = cleanTask;
exports.minify = minifyTask;
exports.watch = watchTask;
exports.buildJS = buildJSTask;
exports.build = series(cleanTask, buildJSTask, minifyTask);
exports.default = series(cleanTask, buildJSTask, watchTask);