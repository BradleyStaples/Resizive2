'use strict';

var autoprefixer = require('gulp-autoprefixer');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var gulp = require('gulp');
var jade = require('gulp-jade');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var minifycss = require('gulp-minify-css');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var svgo = require('gulp-svgo');
var tinylr = require('tiny-lr')();
var uglify = require('gulp-uglify');


var notifyLiveReload = function (event) {
    var fileName = require('path').relative(__dirname, event.path);

    tinylr.changed({
        body: {
            files: [fileName]
        }
    });
};


gulp.task('clean-files', function () {
    return gulp.src('dist/stylesheets/resizive.css', {
            read: false
        })
        .pipe(clean());
});


gulp.task('combine-and-minify-js', ['move-js-to-dist'], function () {
    gulp.src('./dist/javascripts/*.js')
        .pipe(uglify())
        .pipe(concat('resizive.js'))
        .pipe(gulp.dest('./dist/javascripts'));
});


gulp.task('copy-favicon', function () {
    gulp.src('./lib/images/favicon.ico')
        .pipe(gulp.dest('./dist/'));
});


gulp.task('jade-to-html', function () {
    gulp.src('./lib/views/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./dist/'));
});


gulp.task('lint-js', function () {
    gulp.src(['./lib/js/*.js', 'bin/www'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('lint-js-styles', function () {
    return gulp.src(['./*.js', './lib/js/*.js'])
        .pipe(jscs());
});


gulp.task('live-reload', function () {
    tinylr.listen(3001); // ./bin/www uses 3000
});


gulp.task('minifiy-css', ['sass-to-css', 'prefix-css'], function () {
    gulp.src('./dist/stylesheets/*.css')
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('./dist/stylesheets'));
});


gulp.task('minify-svgs', function () {
    gulp.src('./lib/images/*.svg')
        .pipe(svgo())
        .pipe(gulp.dest('dist/images'));
});


gulp.task('move-js-to-dist', function () {
    gulp.src(['./lib/js/*.js', './lib/js/external/*.js'])
        .pipe(gulp.dest('dist/javascripts'));
});


gulp.task('prefix-css', ['sass-to-css'], function () {
    gulp.src('./dist/stylesheets/*.css')
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('./dist/stylesheets'));
});


gulp.task('start-dev', function () {
    nodemon({
        script: './bin/www',
        env: {
            NODE_ENV: 'development'
        }
    });
});


gulp.task('sass-to-css', function () {
    gulp.src('./lib/sass/resizive.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            style: 'expanded'
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./dist/stylesheets'));
});



gulp.task('watch-files', function () {
    gulp.watch('./lib/sass/*.scss', ['prefix-css']);
    gulp.watch('./lib/js/*.js', ['move-js-to-dist']);
    gulp.watch('./lib/views/*.jade', ['jade-to-html']);
    gulp.watch('./dist/*.html', notifyLiveReload);
    gulp.watch('./dist/javascripts/*.js', notifyLiveReload);
    gulp.watch('./dist/stylesheets/*.css', notifyLiveReload);
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
    'start-dev',
    'jade-to-html',
    'live-reload',
    'watch-files'
];
gulp.task('default', default_tasks, function () {

});


var build_tasks = [
    'verify',
    'minifiy-css',
    'minify-svgs',
    'jade-to-html',
    'move-js-to-dist',
    'combine-and-minify-js',
    'copy-favicon',
    'clean-files'
];
gulp.task('build', build_tasks, function () {

});
