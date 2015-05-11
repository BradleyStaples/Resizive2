var autoprefixer = require('gulp-autoprefixer'),
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

gulp.task('coffee', function () {
	// not working atm
	gulp.src('./lib/coffee/*.coffee')
    	.pipe(coffee({bare: true})
    		.on('error', gutil.log))
    	.pipe(gulp.dest('./dist/javascripts'))
});

gulp.task('html', function() {
	gulp.src('./lib/views/*.jade')
		.pipe(jade({pretty: true}))
		.pipe(gulp.dest('./dist/'))
});

gulp.task('js', function () {
	gulp.src('./lib/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('./dist/javascripts'));
});

gulp.task('lintcoffee', function () {
    gulp.src('./lib/coffee/*.coffee')
        .pipe(coffeelint())
        .pipe(coffeelint.reporter())
});

gulp.task('lintjs', function () {
 	gulp.src('./lib/js/*.js')
    	.pipe(jshint())
    	.pipe(jshint.reporter('default'));
});

gulp.task('livereload', function () {
	tinylr.listen(3001); // ./bin/www uses 3000
});

gulp.task('start', function () {
	nodemon({
		script: './bin/www',
		env: {
			'NODE_ENV': 'development'
		}
	});
});

gulp.task('styles', function () {
	gulp.src('./lib/sass/resizive.scss')
		.pipe(sass({style: 'expanded'}))
		.pipe(autoprefixer('last 2 version'))
		.pipe(gulp.dest('./dist/stylesheets'))
});

gulp.task('styles-min', function () {
	gulp.src('./lib/sass/resizive.scss')
		.pipe(sass({style: 'compressed'}))
		.pipe(autoprefixer('last 2 version'))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest('./dist/stylesheets'));
});

gulp.task('watch', function () {
	gulp.watch('./lib/sass/*.scss', ['styles']);
	gulp.watch('./lib/js/*.js', ['lintjs']);
	gulp.watch('./lib/coffee/*.coffee', ['lintcoffee']);
	gulp.watch('./lib/js/*.js', notifyLiveReload);
	gulp.watch('./lib/views/*.jade', notifyLiveReload);
	gulp.watch('./dist/stylesheets/*.css', notifyLiveReload);
});

gulp.task('default', ['styles', 'js', 'coffee', 'start', 'livereload', 'watch'], function () {

});

gulp.task('build', ['styles-min', 'html', 'lintjs', 'js', 'lintcoffee', 'coffee'], function () {

});