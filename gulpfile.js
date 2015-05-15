// gulp
var gulp = require('gulp');

// plugins
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

// karma
var karma = require('karma').server;

gulp.task('build', function () {
  return gulp.src('src/relate.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function() {
    done();
  });
});
