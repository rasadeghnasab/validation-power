var flatten = require('gulp-flatten');
var gulp    = require('gulp');
var gutil   = require('gulp-util');
var minify  = require('gulp-minify');
var pump    = require('pump');

gulp.task('default', ['init', 'make', 'watch']);

gulp.task('css-init', function () {
	return gulp.src([
		'./bower_components/bootstrap/dist/css/bootstrap.min.css',
		// if bootstrap is rtl version uncomment these lines
		// './bower_components/bootstrap/dist/css/bootstrap-flipped.min.css',
		// './bower_components/bootstrap/dist/css/bootstrap-rtl.min.css',
		'./bower_components/persian-datepicker/dist/css/persian-datepicker-0.4.5.min.css',
	], {base: './bower_components/'})
		.pipe(flatten())
		.pipe(gulp.dest('./demo/css/'))
		;
});

gulp.task('font-init', function () {
	return gulp.src([
		'./bower_components/bootstrap/dist/fonts/*',
	], {base: './bower_components/'})
		.pipe(flatten())
		.pipe(gulp.dest('./demo/fonts/'))
		;
});

gulp.task('js-init', function () {
	return gulp.src([
		'./bower_components/jquery/dist/jquery.min.js',
		'./bower_components/jquery-migrate/jquery-migrate.min.js',
		'./bower_components/persian-date/dist/0.1.8/persian-date-0.1.8.min.js',
		'./bower_components/persian-datepicker/dist/js/persian-datepicker-0.4.5.min.js',
		'./bower_components/bootstrap/dist/js/bootstrap.min.js',
	], {base: './bower_components/'})
		.pipe(flatten())
		.pipe(gulp.dest('./demo/js/'))
		.pipe(gulp.dest('./src/js/'))
		;
});

gulp.task('init', ['css-init', 'js-init', 'font-init']);

gulp.task('make', function (cb) {
	pump([
			gulp.src([
				'./src/jquery.validation-power.js',
			]),
			gulp.dest('./demo/js/'),
			minify(),
			gulp.dest('./dist/'),
		],
		cb
	);
});

gulp.task('watch', function() {
	gulp.watch('./src/jquery.validation-power.js', ['make']);
});


// DONE:: 1.gulp initial copies (task): when we run this task required css and js files from node_modules will copy to src[js|css] and demo[js|css]
// DONE:: 2.gulp make (task): create plugin.js file from src/js/plugin_name.js to demo/js/plugin_name.js
// DONE:: 3.gulp watch: do gulp make every time src/js/plugin_name.js file changed.
// DONE:: 4.gulp production(default) (task): run gulp copies, gulp make, gulp minimize
