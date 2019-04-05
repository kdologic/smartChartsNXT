"use strict";

let gulp = require('gulp');
let insert = require('gulp-insert');
let rename = require('gulp-rename');
let webpack = require("webpack-stream");
let webpackConfig = require('./webpack.config.js');

let srcDir = './js/';
let buildDir = './build/';
let testDir = './test/';

let header = `/** 
* PView test suite
* 
* Copyright 2019 Kausik Dey
* Released under the MIT license
*/
`;

/*
 * Generate a build based on the source file
 */

function buildTask() {
  return gulp.src(srcDir + 'index.js')
    .pipe(webpack(webpackConfig))
    .pipe(rename('pview.test.js'))
    .pipe(insert.prepend(header))
    .pipe(gulp.dest(buildDir));
}

function watchTask() {
  return gulp.watch(['./../../**/*.js','./js/**', './../../viewEngin/*.js', '!./../../**/{build,build/**}'], ['build']);
}

gulp.task('build', buildTask);
gulp.task('watch', watchTask);
gulp.task('default', ['build', 'watch']);
