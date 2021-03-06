"use strict";

let gulp = require('gulp');
let insert = require('gulp-insert');
let connect = require('gulp-connect');


let uglifyEs = require('uglify-es'); //  `uglify-es` for ES6 support
let composer = require('gulp-uglify/composer');
let minify = composer(uglifyEs, console);

let util = require('gulp-util');
let browserify = require('gulp-browserify');
let rename = require('gulp-rename');
let pkg = require('./package.json');


let srcDir = './src/';
let buildDir = './build/';
let testDir = './test/';


gulp.task('build', buildTask);
gulp.task('watch', watchTask);
gulp.task('default', ['build', 'watch']);

let header = `/*
* smartChartsNXT v${pkg.version}
* Released under the MIT license
* https://github.com/kausikongit/smartChartsNXT/blob/develop/LICENSE
*/\n\n`;

/*
 * Generate a build based on the source file
 */

function buildTask() {
    return gulp.src(srcDir + 'build.core.js')
        .pipe(browserify({
            insertGlobals: false
        }))
        .pipe(rename('smartChartsNXT.bundle.js'))
        .pipe(insert.prepend(header))
        .pipe(gulp.dest(buildDir))
        .pipe(minify({}))
        .pipe(rename('smartChartsNXT.bundle.min.js'))
        .pipe(insert.prepend(header))
        .pipe(gulp.dest(buildDir));
}


function watchTask() {
    return gulp.watch('./src/**', ['build']);
}