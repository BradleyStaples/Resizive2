'use strict';

var autoprefixer = require('gulp-autoprefixer');
var del = require('del');
var concat = require('gulp-concat');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jade = require('gulp-jade');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var minifycss = require('gulp-minify-css');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var svgo = require('gulp-svgo');
var uglify = require('gulp-uglify');


gulp.task('clean-files', function (cb) {
    return del(['dist/**/*'], cb);
});


gulp.task('combine-and-minify-js', ['move-js-to-dist'], function () {
    return gulp.src('./dist/javascripts/*.js')
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(concat('resizive.js'))
        .pipe(gulp.dest('./dist/javascripts'));
});


gulp.task('copy-favicon', function () {
    return gulp.src('./lib/images/favicon.ico')
        .pipe(gulp.dest('./dist/'));
});


gulp.task('jade-to-html', function () {
    var device_sizes = require('./lib/js/device_sizes');
    return gulp.src('./lib/views/*.jade')
        .pipe(jade({
            pretty: true,
            data: {
                device_sizes: device_sizes
            }
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest('./dist/'));
});


gulp.task('lint-js', function () {
    return gulp.src(['./lib/js/*.js', 'bin/www'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('lint-js-styles', function () {
    return gulp.src(['./*.js', './lib/js/*.js'])
        .pipe(jscs());
});


gulp.task('minifiy-css', ['sass-to-css', 'prefix-css'], function () {
    return gulp.src('./dist/stylesheets/*.css')
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .on('error', gutil.log)
        .pipe(gulp.dest('./dist/stylesheets'));
});


gulp.task('minify-svgs', function () {
    return gulp.src('./lib/images/*.svg')
        .pipe(svgo())
        .on('error', gutil.log)
        .pipe(gulp.dest('dist/images'));
});


gulp.task('move-images-to-dist', function () {
    return gulp.src(['./lib/images/*.jpg', './lib/images/*.png'])
        .pipe(gulp.dest('dist/images'));
});


gulp.task('move-js-to-dist', function () {
    return gulp.src(['./lib/js/*.js', './lib/js/external/*.js'])
        .pipe(gulp.dest('dist/javascripts'));
});


gulp.task('prefix-css', ['sass-to-css'], function () {
    return gulp.src('./dist/stylesheets/*.css')
        .pipe(autoprefixer('last 2 version'))
        .on('error', gutil.log)
        .pipe(gulp.dest('./dist/stylesheets'));
});


gulp.task('start-dev', function () {
    return nodemon({
        script: './bin/www',
        env: {
            NODE_ENV: 'development'
        }
    });
});


gulp.task('sass-to-css', function () {
    return gulp.src('./lib/sass/resizive.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            style: 'expanded'
        }))
        .on('error', gutil.log)
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./dist/stylesheets'));
});



gulp.task('watch-files', function () {
    gulp.watch('./lib/sass/*.scss', ['prefix-css']);
    gulp.watch('./lib/js/*.js', ['move-js-to-dist']);
    gulp.watch('./lib/views/*.jade', ['jade-to-html']);
});


// todo: lint sass
var verify_tasks = [
    'lint-js',
    'lint-js-styles'
];
gulp.task('verify', verify_tasks, function () {

});


var default_tasks = [
    'prefix-css',
    'move-js-to-dist',
    'move-images-to-dist',
    'start-dev',
    'jade-to-html',
    'watch-files'
];
gulp.task('default', default_tasks, function () {

});


var build_tasks = [
    'clean-files',
    'verify',
    'minifiy-css',
    'minify-svgs',
    'jade-to-html',
    'move-js-to-dist',
    'combine-and-minify-js',
    'copy-favicon',
    'move-images-to-dist'
];
gulp.task('build', build_tasks, function () {

});
