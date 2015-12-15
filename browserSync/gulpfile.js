var gulp = require('gulp');
var browserSync = require('browser-sync');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();
var reload = browserSync.reload;

var testDir = '.tmp';
var src = {
    scss: testDir + '/scss/*.scss',
    css: testDir + '/css',
    html: testDir + '/*.html'
};

gulp.task('styles', function() {
    return gulp.src(src.scss)
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            precision: 10
        }).on('error', $.sass.logError))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest(src.css))

    // uncomment one of the following before `gulp serve`

    // this works with gulp-filter
    // .pipe($.filter('*.css'))
    // .pipe(reload({stream: true}));

    // this works with gulp-if
    // .pipe($.if('*.css', reload({stream: true})));


    // this `match` work with normal-named dir
    // however it ignores the dir like `.tmp`
    .pipe(reload({stream: true, match: '**/*.css'}));

});

gulp.task('serve', ['styles'], function() {

    browserSync({
        notify: false,
        server: testDir
    });

    gulp.watch(src.scss, ['styles']);
    gulp.watch(src.html).on('change', reload);
});
