"use strict";

var gulp = require('gulp');
var insert = require('gulp-insert');
//var replace = require('gulp-replace');
//var concat = require('gulp-concat');
var connect = require('gulp-connect');
//var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
//var util = require('gulp-util');
//var notify = require("gulp-notify");
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
//var source = require('vinyl-source-stream');
//var merge = require('merge-stream');
var pkg = require('./package.json');


var srcDir = './src/';
var buildDir = './public/';
var testDir = './test/';


gulp.task('build', buildTask);
gulp.task('watch', watchTask);
gulp.task('default', ['build', 'watch']);

var header = `/*
* smartChartsNXT v${pkg.version}
* Released under the MIT license
* https://github.com/kausikongit/smartChartsNXT/blob/develop/LICENSE
*/\n\n`;

/*
 * Generate a build based on the source file
 */
// function buildTask() {
//     var bundled = browserify(srcDir + 'build.core.js', {debug: true})
//         .on('error', notify.onError({
//             message: "Error: <%= error.message %>",
//             title: "Failed running browserify"
//         }))
//         .bundle()
//         .on('error', notify.onError({
//             message: "Error: <%= error.message %>",
//             title: "Failed running browserify"
//         }))
//         .pipe(source('smartChartsNXT.bundle.js'))
//         .pipe(insert.prepend(header))
//         .pipe(gulp.dest(buildDir));
// }
function buildTask() {
    var bundled = gulp.src(srcDir + 'build.core.js')
        .pipe(browserify({
            insertGlobals: false
        }))
        .pipe(rename('smartChartsNXT.bundle.js'))
        .pipe(insert.prepend(header))
        .pipe(gulp.dest(buildDir));
        // .pipe(uglify())
        // .pipe(rename('smartChartsNXT.bundle.min.js'))
        // .pipe(insert.prepend(header))
        // .pipe(gulp.dest(buildDir));
}


function watchTask() {
    return gulp.watch('./src/**', ['build']);
}