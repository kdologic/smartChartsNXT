"use strict";

let gulp = require('gulp');
let insert = require('gulp-insert');
let connect = require('gulp-connect');

let uglifyEs = require('uglify-es'); //  `uglify-es` for ES6 support
let composer = require('gulp-uglify/composer');
let minify = composer(uglifyEs, console);

let util = require('gulp-util');
let rename = require('gulp-rename');

let webpack = require("webpack-stream");
let webpackConfig = require('./webpack.config.js');

let pkg = require('./package.json');
let srcDir = './src/';
let buildDir = './public/';
let testDir = './test/';

let header = `/** 
* SmartChartsNXT
* http://www.smartcharts.cf
* Version:${pkg.version}
* 
* Copyright 2018 Kausik Dey
* Released under the MIT license
* https://github.com/kausikongit/smartChartsNXT/blob/develop/LICENSE
*/
`;

/*
 * Generate a build based on the source file
 */

function buildTask() {
  return gulp.src(srcDir + 'build.core.js')
    .pipe(webpack(webpackConfig))
    .pipe(rename('smartChartsNXT.bundle.js'))
    .pipe(insert.prepend(header))
    .pipe(gulp.dest(buildDir));
}

function minifyTask() {
  return gulp.src(buildDir + 'smartChartsNXT.bundle.js')
    .pipe(minify({}))
    .pipe(rename('smartChartsNXT.bundle.min.js'))
    .pipe(insert.prepend(header))
    .pipe(gulp.dest(buildDir));
}

function watchTask() {
  return gulp.watch('./src/**', ['build']);
}

gulp.task('build', buildTask);
gulp.task('minify', ['build'], minifyTask );
gulp.task('watch', watchTask);
gulp.task('default', ['build', 'watch']);
gulp.task('release', ['build', 'minify']);
