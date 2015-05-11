var autoprefixer = require('gulp-autoprefixer'),
	clean = require('gulp-clean')
	coffee = require('gulp-coffee'),
	coffeelint = require('gulp-coffeelint'),
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	jade = require('gulp-jade'),
	jshint = require('gulp-jshint'),
	minifycss = require('gulp-minify-css'),
	nodemon = require('gulp-nodemon'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
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
}

gulp.task('clean-files', function () {
    return gulp.src('dist/stylesheets/resizive.css', {read: false})
        .pipe(clean());
});

gulp.task('coffee-to-javascript', function () {
	// not working atm
	gulp.src('./lib/coffee/*.coffee')
    	.pipe(coffee({bare: true})
    		.on('error', gutil.log))
    	.pipe(gulp.dest('./dist/javascripts'))
});


gulp.task('jade-to-html', function() {
	gulp.src('./lib/views/*.jade')
		.pipe(jade({pretty: true}))
		.pipe(gulp.dest('./dist/'))
});


gulp.task('lint-coffee', function () {
    gulp.src('./lib/coffee/*.coffee')
        .pipe(coffeelint())
        .pipe(coffeelint.reporter())
});


gulp.task('lint-js', function () {
 	gulp.src('./lib/js/*.js')
    	.pipe(jshint())
    	.pipe(jshint.reporter('default'));
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


gulp.task('minify-js', function () {
	gulp.src('./lib/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('./dist/javascripts'));
});


gulp.task('minify-svgs', function () {
    gulp.src('./lib/images/*.svg')
        .pipe(svgo())
        .pipe(gulp.dest('dist/images'));
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
		.pipe(sass({style: 'expanded'}))
		.pipe(gulp.dest('./dist/stylesheets'))
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
	'minify-js',
	'lint-coffee',
	'coffee-to-javascript',
	'clean-files'
];
gulp.task('build', build_tasks, function () {

});