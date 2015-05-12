'use strict';

var autoprefixer = require('gulp-autoprefixer'),
	clean = require('gulp-clean'),
	coffee = require('gulp-coffee'),
	coffeelint = require('gulp-coffeelint'),
	concat = require('gulp-concat'),
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	jade = require('gulp-jade'),
	jscs = require('gulp-jscs'),
	jshint = require('gulp-jshint'),
	minifycss = require('gulp-minify-css'),
	nodemon = require('gulp-nodemon'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	svgo = require('gulp-svgo'),
	tinylr = require('tiny-lr')(), 
	uglify = require('gulp-uglify');


var notifyLiveReload = function (event) {
	var fileName = require('path').relative(__dirname, event.path);

	tinylr.changed({
		body: {
			files: [fileName]
		}
	});
};


gulp.task('clean-files', function () {
    return gulp.src('dist/stylesheets/resizive.css', {read: false})
        .pipe(clean());
});


gulp.task('coffee-to-javascript', function () {
	gulp.src('./lib/coffee/*.coffee')
		.pipe(sourcemaps.init())
		.pipe(coffee({bare: true})).on('error', gutil.log)
		.pipe(sourcemaps.write('./maps'))
    	.pipe(gulp.dest('./dist/javascripts'));
});


gulp.task('combine-and-minify-js', ['move-js-to-dist'], function () {
	gulp.src('./dist/javascripts/*.js')
    	.pipe(uglify())
    	.pipe(concat('resizive.js'))
    	.pipe(gulp.dest('./dist/javascripts'));
});


gulp.task('jade-to-html', function() {
	gulp.src('./lib/views/*.jade')
		.pipe(jade({pretty: true}))
		.pipe(gulp.dest('./dist/'));
});


gulp.task('lint-coffee', function () {
    gulp.src('./lib/coffee/*.coffee')
        .pipe(coffeelint())
        .pipe(coffeelint.reporter());
});


gulp.task('lint-js', function () {
 	gulp.src('./lib/js/*.js')
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
		.pipe(rename({suffix: '.min'}))
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
			'NODE_ENV': 'development'
		}
	});
});


gulp.task('sass-to-css', function () {
	gulp.src('./lib/sass/resizive.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({style: 'expanded'}))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./dist/stylesheets'));
});


gulp.task('watch-files', function () {
	gulp.watch('./lib/sass/*.scss', ['prefix-css']);
	// gulp.watch('./lib/js/*.js', ['lint-js']);
	// gulp.watch('./lib/coffee/*.coffee', ['lint-coffee']);
	gulp.watch('./lib/js/*.js', notifyLiveReload);
	gulp.watch('./lib/views/*.jade', notifyLiveReload);
	gulp.watch('./dist/stylesheets/*.css', notifyLiveReload);
});


var default_tasks = [
	'prefix-css',
	'coffee-to-javascript',
	'move-js-to-dist',
	'start-dev',
	'live-reload',
	'watch-files'
];
gulp.task('default', default_tasks, function () {

});


var build_tasks = [
	'minifiy-css',
	'minify-svgs',
	'jade-to-html',
	'lint-js',
	'move-js-to-dist',
	'combine-and-minify-js',
	'lint-coffee',
	'coffee-to-javascript',
	'clean-files'
];
gulp.task('build', build_tasks, function () {

});