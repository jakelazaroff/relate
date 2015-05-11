// gulp
var gulp = require('gulp');

// plugins
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

gulp.task('build', function () {
  return gulp.src('src/relate.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build']);
