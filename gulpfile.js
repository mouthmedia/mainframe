// --------------------------------------------------
// VARS
// --------------------------------------------------

var gulp = require('gulp');

var del = require('del');
var sass = require('gulp-sass')
var gulpIf = require('gulp-if');
var cache = require('gulp-cache');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var depLinker = require('dep-linker');
var imagemin = require('gulp-imagemin');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();

// --------------------------------------------------
// DEV TASKS
// --------------------------------------------------

// BrowserSync
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'build'
        },
    })
})

// SASS Compile + Autoprefixer
gulp.task('sass', function(){
    return gulp.src('build/styles/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 4 versions'))
    .pipe(gulp.dest('build/styles'))
    .pipe(browserSync.reload({
        stream: true
    }))
});

// Main Watch
gulp.task('watch', function() {
    gulp.watch('build/styles/scss/**/*.scss', ['sass']);
    gulp.watch('build/*.html', browserSync.reload);
    gulp.watch('build/js/**/*.js', browserSync.reload);
});

// --------------------------------------------------
// OPTIMIZATION TASKS
// --------------------------------------------------

// Useref
gulp.task('useref', function(){
  return gulp.src('build/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

// Imagemin
gulp.task('images', function(){
    return gulp.src('build/images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin({
        interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
});

// Copy Fonts
gulp.task('fonts', function() {
    return gulp.src('build/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})

//Copy Scripts
gulp.task('link', function () {
  return depLinker.linkDependenciesTo('./build/js/scripts');
});

// --------------------------------------------------
// ClEANUP TASKS
// --------------------------------------------------

// Clean
gulp.task('clean', function() {
    return del.sync('dist').then(function(cb) {
        return cache.clearAll(cb);
    });
})

// Soft Clean
gulp.task('clean:dist', function() {
    return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// --------------------------------------------------
// BUILD TASKS
// --------------------------------------------------

gulp.task('default', function (callback) {
    runSequence(['sass','browserSync', 'watch'], callback)
})

gulp.task('build', function(callback) {
    runSequence('clean:dist', 'sass',['useref', 'images', 'fonts'], callback)
})
