// gulp
var gulp = require('gulp');

// plugins
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var eol = require('gulp-eol');

// karma
var karma = require('karma').server;

gulp.task('lint', function() {

  return gulp.src('src/relate.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});


gulp.task('test', ['lint'], function (done) {

  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function() {
    done();
  });
});


gulp.task('build', ['test'], function () {

  return gulp.src('src/relate.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(eol())
    .pipe(gulp.dest('dist'));
});
