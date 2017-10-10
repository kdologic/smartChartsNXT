"use strict";

let gulp = require('gulp');
let connect = require('gulp-connect');
let headerComment = require('gulp-header-comment');

let uglify = require("gulp-uglify"); // for minify es5 codes
let uglifyEs = require('uglify-es'); //  `uglify-es` for ES6 support
let composer = require('gulp-uglify/composer');
let minify = composer(uglifyEs, console);

let gutil = require('gulp-util');
let gBrowserify = require('gulp-browserify');
let browserify = require('browserify');
let babelify = require('babelify');
let source = require('vinyl-source-stream'); //to convert text-stream into vinyl-stram
let buffer = require("vinyl-buffer"); // to conver stream-vinyl into bufferd-vinyl
let rename = require('gulp-rename');
let pkg = require('./package.json');


let srcDir = './src/';
let buildDir = './public/';
let testDir = './test/';


gulp.task('build', buildTask);
gulp.task('buildTaskWithTranspiler', buildTaskWithTranspiler);
gulp.task('watch', watchTask);
gulp.task('release', ['buildTaskWithTranspiler', 'watch']);
gulp.task('default', ['build', 'watch']);

let header = `
SmartChartsNXT
http://www.smartcharts.cf
Version:${pkg.version}

Copyright 2017 Kausik Dey
Released under the MIT license
https://github.com/kausikongit/smartChartsNXT/blob/develop/LICENSE
`;

/*
 * Generate a build based on the source file
 */

function buildTask() {
    return gulp.src(srcDir + 'build.core.js')
        .pipe(gBrowserify({
            insertGlobals: false
        }))
        .pipe(rename('smartChartsNXT.bundle.js'))
        .pipe(headerComment(header))
        .pipe(gulp.dest(buildDir))
        .pipe(minify({}))
        .pipe(rename('smartChartsNXT.bundle.min.js'))
        .pipe(headerComment(header))
        .pipe(gulp.dest(buildDir));
}

function buildTaskWithTranspiler() {
    return browserify({
            entries: srcDir + 'build.core.js',
            debug: false,
            insertGlobals: false
        })
        .transform(babelify, {presets: ["es2015"],extensions: ['.js']})
        .bundle().on('error', err => {
            gutil.log("Browserify Error", gutil.colors.red(err.message));
        })
        .pipe(source('smartChartsNXT.bundle.js'))
        .pipe(headerComment(header))
        .pipe(gulp.dest(buildDir))
        .pipe(buffer())
        .pipe(uglify()).on('error', err => {
            gutil.log("Minification Error", gutil.colors.red(err));
        })
        .pipe(rename('smartChartsNXT.bundle.min.js'))
        .pipe(headerComment(header))
        .pipe(gulp.dest(buildDir));
}


function watchTask() {
    return gulp.watch('./src/**', ['build']);
}