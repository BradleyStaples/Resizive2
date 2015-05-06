var autoprefixer = require('gulp-autoprefixer'),
	gulp = require('gulp'),
	minifycss = require('gulp-minify-css'),
	nodemon = require('gulp-nodemon'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	tinylr = require('tiny-lr')();

gulp.task('livereload', function() {
	tinylr.listen(3001); // ./bin/www uses 3000
});

var notifyLiveReload = function (event) {
	var fileName = require('path').relative(__dirname, event.path);

	tinylr.changed({
		body: {
			files: [fileName]
		}
	});
}

gulp.task('start', function () {
	nodemon({
		script: './bin/www',
		env: {
			'NODE_ENV': 'development'
		}
	});
});

gulp.task('styles', function() {
	return gulp.src('./sass/resizive.scss')
		.pipe(sass({style: 'expanded'}))
		.pipe(autoprefixer('last 2 version'))
		.pipe(gulp.dest('./public/stylesheets'))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('watch', function() {
	gulp.watch('sass/*.scss', ['styles']);
	gulp.watch('views/*.jade', notifyLiveReload);
	gulp.watch('public/stylesheets/*.css', notifyLiveReload);
});

gulp.task('default', ['styles', 'start', 'livereload', 'watch'], function() {

});