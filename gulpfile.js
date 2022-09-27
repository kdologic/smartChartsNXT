'use strict';

const argv = require('yargs').argv;
process.env.NODE_ENV = argv.env == 'production' ? 'production' : 'development';

const { src, dest, series, watch } = require('gulp');
const insert = require('gulp-insert');
const clean = require('gulp-clean');
const gulpIf = require('gulp-if');
const minify = require('gulp-terser');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

const pkg = require('./package.json');
const srcDir = './src/';
const buildDir = './dist/';
const tsSrc = ['src/**/*.js','src/**/*.ts'];
const tsBuildDir = './dist/types/';
const testDir = './test/';
const libName = 'smartchartsnxt';


const isProduction = process.env.NODE_ENV == 'production';
let buildType = isProduction ? 'Production Build' : 'Development Build';
buildType += ' - ' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' , hour:'numeric', minute:'numeric', second:'numeric'});

const header = `/**
* ${pkg.title}
* ${pkg.homepage}
* Version: ${pkg.version}
* ${buildType}
*
* Copyright 2022 (c) ${pkg.author.name}<${pkg.author.email}>
* Released under the ${pkg.license} license
* https://github.com/kdologic/smartChartsNXT/blob/develop/LICENSE
*/
`;

/*
 * Generate a build based on the source file
 */

function buildJSTask() {
  let stream = src(srcDir)
    .pipe(webpack(webpackConfig))
    .pipe(replace('__version__', pkg.version));

  stream = stream.pipe(gulpIf(shouldInsertHeader, insert.prepend(header)));
  return stream.pipe(dest(buildDir));
}

function shouldInsertHeader(file) {
  const isSourceMap = /\.map$/.test(file.path);
  return !isSourceMap;
}

function minifyTask() {
  return src(buildDir + `${libName}.js`)
    .pipe(minify({
      'compress': {
        'booleans_as_integers': true,
        'drop_console': true,
        'drop_debugger': true,
        'side_effects': false,
        'warnings': true,
        'passes': 3
      },
      'keep_classnames': true,
      'keep_fnames': true
    }))
    .pipe(rename(`${libName}.min.js`))
    .pipe(insert.prepend(header))
    .pipe(dest(buildDir));
}

function typeDefTask() {
  return src(tsSrc)
    .pipe(tsProject())
    .pipe(dest(tsBuildDir));
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
exports.typeDef = typeDefTask;
exports.build = series(cleanTask, typeDefTask, buildJSTask, minifyTask);
exports.default = series(cleanTask, buildJSTask, watchTask);