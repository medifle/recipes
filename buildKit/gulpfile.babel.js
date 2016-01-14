// 'use strict';

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import {stream as wiredep} from 'wiredep';
import lazypipe from 'lazypipe';
import htmlInjector from "bs-html-injector";

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const AUTOPREFIXER_BROWSERS = [
    'ie >= 8',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 31',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];
const imgSrc = 'app/images/**/*';
const htmlSrc = 'app/*.html';
const scssSrc = 'app/assets/**/*.scss'; // for watch task

// For 'styles' task's performance, put all partials into subdirs
// Leave scss `main` dir for main scss files
const scssMainSrc = 'app/assets/main/*.scss';

const jsSrc = 'app/assets/**/*.js';
const fontSrc = 'app/font/**/*.{eot,svg,ttf,woff,woff2}';


var release = false;

gulp.task('release', () => {
  return release = true;
});


// Lint JavaScript
gulp.task('lint', () =>
  gulp.src(jsSrc)
    .pipe($.eslint())
    .pipe($.eslint.format())
    // .pipe($.if(!browserSync.active, $.eslint.failOnError()))
);

// Optimize images, little effect
gulp.task('images', () => {
  gulp.src(imgSrc)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});


// Copy all files at the root level (app), especially for font.
gulp.task('copy', () =>
  gulp.src([
    'app/**/*',
    '!app/*.html',
    '!app/images/**/*',
    '!app/styles/**/*',
    '!app/scripts/**/*',
    '!app/assets/**/*',
    '!app/**/*.DS_Store',
    '!app/bower_components/**/*',
    '!app/bower_components'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy', showFiles: true}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  // For best performance, don't add
  // Sass partials(whether starting as
  // underscore or not) to `gulp.src`
  return gulp.src(scssMainSrc)

    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10,
      outputStyle: 'expanded'
    }).on('error', $.sass.logError))
    // May take too long to run
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))


    //## For development environment
    .pipe($.if(!release, $.sourcemaps.write('./')))
    .pipe($.if(!release, gulp.dest('tmp/assets/styles')))

    //## For production environment
    // Minify styles
    .pipe($.if(release, $.if('*.css', $.cssnano({discardComments: {removeAll: true}}))))
    .pipe($.if(release, $.sourcemaps.write('./')))
    .pipe($.if(release, gulp.dest('dist/assets/styles')))

    .pipe($.size({title: 'styles',
     // showFiles: true
   }))
    .pipe(reload({stream: true, match: '**/*.css'}));
});


// Scan your HTML for JS assets & optimize them
gulp.task('html', () => {
  return gulp.src(htmlSrc)
    // For development
    // Use wiredep in combine with `bower_components` route option in browserSync
    .pipe($.if(!release, wiredep({
      // cwd: 'app/',
      // exclude: [''],
      // ignorePath: /^(\.\.\/)*\.\./
    })))

    // Concat is default behavior, use noconcat option to disable it
    .pipe($.if(!release, $.useref({
      // searchPath: 'app',
      noconcat: true,
    })))

    // TODO: It seems gulp-cached or use-ref do not support double dots,
    // like ../bower_components/path/name.js
    // so files after double dots path would not be cached
    .pipe($.if(!release, $.cached('jsca')))
    .pipe($.if(!release, $.sourcemaps.init()))
    .pipe($.if(!release, $.if(/\.js$/, $.babel())))


    // For production
    .pipe($.if(release, wiredep()))

    .pipe($.if(release, $.useref({},

      // do sth before useref concat
      // TODO: wiredep fails in lazypipe
      // TODO: lazypipe do not work with gulp-autoprefixer and gulp-sourcemaps
      // the `source` entry of generated css sourcemaps is broken
      // if this work is completed, auto-identifing css files in bower_components and generating them in specified path of dist dir in production mode would be available
      // Need to see useref source code
      // TODO: use gulp-debug to see what files are run through gulp pipeline
      // TODO: gulp-usemin may be an alternative
      lazypipe()

      .pipe($.sourcemaps.init)
      .pipe( () => {
        return $.if(/\.js$/, $.babel());
      })
    )))

    .pipe($.if(release, $.if(/\.css$/, $.cssnano({discardComments: {removeAll: true}}))))
    .pipe($.if(release ,$.if(/\.js$/, $.uglify())))

    .pipe($.sourcemaps.write('./'))

    // Minify any HTML
    // .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))

    // Output files
    .pipe($.if(!release, gulp.dest('tmp')))
    .pipe($.if(release, gulp.dest('dist')))
    .pipe($.size({
      title: 'html',
      showFiles: true
    }));
});

// Clean output directory
gulp.task('clean', cb => del(['tmp', 'dist/*', '!dist/.git'], {dot: true}));

// For development
// Watch files for changes & reload
gulp.task('serve', ['html', 'styles'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    // logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    // scrollElementMapping: ['main',],

    // it would be really helpful when other js force full reload
    // and scroll to top
    plugins: [
        {
            module: "bs-html-injector"
        }
    ],

    server: {
        // the order of dir determine the priority of the dirs served
        baseDir: ['tmp', 'app'],
        // The key is the url to match
        // The value is which folder to serve relative to your gulpfile
        // routes: {
        //     "/bower_components": "bower_components"
        // }
    },
    port: 3000
  });

  gulp.watch([htmlSrc], ['html', reload]);
  // gulp.watch([htmlSrc], ['html', htmlInjector]);
  gulp.watch([scssSrc], ['styles']);
  gulp.watch([jsSrc, 'bower.json'], ['html', reload]);
  gulp.watch([fontSrc, imgSrc], reload);
});



// Builds a production version of your site, starts a server, and opens a browser for you.
// This doesn’t have Live Reload or Browser Sync,
// but it’s a reliable way of testing your site before deploying it.
gulp.task('serve:dist', ['default'], () =>
  browserSync({
    notify: false,

    server: {
        baseDir: "dist",
        // routes: {
        //     "/bower_components": "bower_components"
        // }
    },
    port: 4000
  })
);

// Build production files, the default task
gulp.task('default', ['clean', 'release'], cb =>
  runSequence(
    ['styles', 'html', 'images', 'copy'],
    cb
  )
);
