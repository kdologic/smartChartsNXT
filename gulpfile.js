'use strict';

const argv = require('yargs').argv;

process.env.NODE_ENV = argv.env == 'production' ? 'production' : 'development';

const gulp = require('gulp');
const insert = require('gulp-insert');

const minify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');

const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

const pkg = require('./package.json');
const srcDir = './src/';
const buildDir = './public/';
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

function buildTask() {

  return gulp.src(srcDir + 'index.js')
    .pipe(webpack(webpackConfig))
    .pipe(rename('smartChartsNXT.bundle.js'))
    .pipe(insert.prepend(header))
    .pipe(gulp.dest(buildDir));
}

function minifyTask() {
  return gulp.src(buildDir + 'smartChartsNXT.bundle.js')
    .pipe(minify({
      'keep_classnames': true,
      'keep_fnames': true
    }))
    .pipe(rename('smartChartsNXT.bundle.min.js'))
    .pipe(insert.prepend(header))
    .pipe(gulp.dest(buildDir));
}

function watchTask() {
  return gulp.watch('./src/**', ['build']);
}

gulp.task('build', buildTask);
gulp.task('minify', ['build'], minifyTask);
gulp.task('watch', watchTask);
gulp.task('default', ['build', 'watch']);
gulp.task('release', ['build', 'minify']);