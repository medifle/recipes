var gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  lazypipe = require('lazypipe');

var release = false;

gulp.task('default', function() {
  return gulp.src('app/index.html')
    .pipe(useref({ noconcat: true })).pipe(sourcemaps.init({ loadMaps: true }))

    .pipe(gulpif(release, useref({},
      lazypipe().pipe(sourcemaps.init, { loadMaps: true })
    )))

    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});

