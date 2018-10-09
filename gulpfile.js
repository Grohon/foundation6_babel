var gulp = require('gulp');
var $    = require('gulp-load-plugins')();
var gutil = require('gulp-util');
var browserSync  =  require('browser-sync').create();
var stripCssComments = require('gulp-strip-css-comments');
var spritesmith = require('gulp.spritesmith');
let cleanCSS = require('gulp-clean-css');
var filter = require('gulp-filter');
var sassPaths = [
  'node_modules/foundation-sites/scss',
  'node_modules/motion-ui/src',
  'node_modules/font-awesome/scss'
];
// Select Foundation components, remove components project will not use
const FOUNDATION = 'node_modules/foundation-sites';
const SOURCE = {
  scripts: [
    // Lets grab what-input first
      'node_modules/jquery/dist/jquery.min.js',
      // 'node_modules/what-input/dist/what-input.js',

    // Foundation core - needed if you want to use any of the components below
    // FOUNDATION + '/dist/js/plugins/foundation.core.js',
    // FOUNDATION + '/dist/js/plugins/foundation.util.*.js',

    // Pick the components you need in your project
    // FOUNDATION + '/dist/js/plugins/foundation.abide.js',
    // FOUNDATION + '/dist/js/plugins/foundation.accordion.js',
    // FOUNDATION + '/dist/js/plugins/foundation.accordionMenu.js',
    // FOUNDATION + '/dist/js/plugins/foundation.drilldown.js',
    // FOUNDATION + '/dist/js/plugins/foundation.dropdown.js',
    // FOUNDATION + '/dist/js/plugins/foundation.dropdownMenu.js',
    // FOUNDATION + '/dist/js/plugins/foundation.equalizer.js',
    // FOUNDATION + '/dist/js/plugins/foundation.interchange.js',
    // FOUNDATION + '/dist/js/plugins/foundation.offcanvas.js',
    // FOUNDATION + '/dist/js/plugins/foundation.orbit.js',
    // FOUNDATION + '/dist/js/plugins/foundation.responsiveAccordionTabs.js',
    // FOUNDATION + '/dist/js/plugins/foundation.responsiveMenu.js',
    // FOUNDATION + '/dist/js/plugins/foundation.responsiveToggle.js',
    // FOUNDATION + '/dist/js/plugins/foundation.reveal.js',
    // FOUNDATION + '/dist/js/plugins/foundation.slider.js',
    // FOUNDATION + '/dist/js/plugins/foundation.smoothScroll.js',
    // FOUNDATION + '/dist/js/plugins/foundation.magellan.js',
    // FOUNDATION + '/dist/js/plugins/foundation.sticky.js',
    // FOUNDATION + '/dist/js/plugins/foundation.tabs.js',
    // FOUNDATION + '/dist/js/plugins/foundation.toggler.js',
    // FOUNDATION + '/dist/js/plugins/foundation.tooltip.js',

    // Place custom JS here, files will be concantonated, minified if ran with --production
    'js/**/*.js',
  ]
};
const JSHINT_CONFIG = {
  "node": true,
  "globals": {
    "document": true,
    "jQuery": true
  }
};
// GULP FUNCTIONS
// JSHint, concat, and minify JavaScript
gulp.task('scripts', function() {
  // Use a custom filter so we only lint custom JS
  const CUSTOMFILTER = filter('js/**/*.js', {restore: true});

  return gulp.src(SOURCE.scripts)
    .pipe($.plumber(function(error) {
            gutil.log(gutil.colors.red(error.message));
            this.emit('end');
        }))
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['@babel/env'],
      compact: true,
      ignore: ['what-input.js']
    }))
    .pipe(CUSTOMFILTER)
      .pipe($.jshint(JSHINT_CONFIG))
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe(CUSTOMFILTER.restore)
    .pipe($.concat('scripts.js'))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('.')) // Creates sourcemap for minified JS
    .pipe(gulp.dest('dist/js/'))
});

gulp.task('sass', function() {
  return gulp.src('scss/style.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: sassPaths,
      outputStyle: 'nested'
    })

    .on('error', $.sass.logError))
    .pipe(stripCssComments(false))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9', 'ios >= 7'],
      cascade: false
    }))
    .pipe($.sourcemaps.init())
    .pipe(cleanCSS())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('copy', function() {
  // gulp.src('node_modules/foundation-sites/dist/css/*.css')
  //   .pipe($.copy('css', {prefix: 4}));
  gulp.src('node_modules/foundation-sites/dist/js/*.js')
    .pipe($.copy('js/libs', {prefix: 4}));
  // gulp.src('node_modules/motion-ui/dist/*.css')
  //   .pipe($.copy('css', {prefix: 3}));
  gulp.src('node_modules/motion-ui/dist/*.js')
    .pipe($.copy('js/libs', {prefix: 3}));
  //gulp.src('node_modules/what-input/dist/*.js')
    //.pipe($.copy('js', {prefix: 3}));
   gulp.src('node_modules/font-awesome/fonts/*.*')
     .pipe($.copy('fonts', {prefix: 3}));
  var activity = "Stylesheets and scripts from /node_modules/foundation-sites/dist and";
  activity += " node_modules/motion-ui/dist copied to /css and /js.";
  activity += " node_modules/font-awesome/fonts/*.* copied to /fonts .";
  gutil.log(activity);
});

gulp.task('sprite', function(){
  var spriteData = gulp.src('./images/sprite/*.png')
    .pipe(spritesmith({
      imgName: './images/sprite.png',
      cssName: '_sprite.scss'
    }));
  var spriteImg = spriteData.img.pipe(gulp.dest(''));
  var spriteCss = spriteData.css.pipe(gulp.dest('./scss/modules/'));
  return (spriteImg && spriteCss);
});
// Start a server with BrowserSync to preview the site in
gulp.task('server', ['sprite', 'sass'], function() {
  browserSync.init({
    proxy: 'http://jslearn.af/'
  });
  gulp.watch(['./js/**/*.js'], ['scripts']);
  gulp.watch(['./scss/**/*.scss'], ['sass']);
  gulp.watch('./images/sprite**/*', ['sprite']);
});

gulp.task('default', ['sass', 'scripts', 'server'], function() {
  gutil.log('watching for .scss file changes in /scss.');
  gulp.watch(['scss/**/*.scss'], ['sass']);
  gulp.watch('./images/sprite**/*', ['sprite']);
});

gulp.task('build', ['sass', 'scripts']);
