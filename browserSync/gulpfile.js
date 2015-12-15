var gulp         = require('gulp');
var browserSync  = require('browser-sync');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();
var reload       = browserSync.reload;

var src = {
    scss: 'app/scss/*.scss',
    css:  'app/css',
    html: 'app/*.html'
};

gulp.task('styles', function() {
  return gulp.src(src.scss)
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp/styles'))

    // TODO: this works with gulp-if
    .pipe($.if('*.css', reload({stream: true})));

    // TODO: this works with gulp-filter
    // .pipe(reload({stream: true, match: '**/*.css'}));
});
