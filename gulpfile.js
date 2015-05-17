// arguments
var argv = require('yargs').argv;

// gulp
var gulp = require('gulp');

// plugins
var replace = require('gulp-replace');
var rename = require("gulp-rename");
var eol = require('gulp-eol');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var bump = require('gulp-bump');
var tap = require('gulp-tap');
var git = require('gulp-git');
var tag = require('gulp-tag-version');

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

function version (file) {
  if (!this.cache && file)
    this.cache = JSON.parse(file.contents.toString()).version;

  return this.cache;
}

function releaseType () {
  if (argv.major) return 'major';
  else if (argv.minor) return 'minor';
  else return 'patch';
}

function build (version) {

  return gulp.src('src/relate.js')
    .pipe(replace('/*VERSION*/', version))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(eol())
    .pipe(gulp.dest('dist'));
}

gulp.task('build', ['test'], function () {

  return gulp.src('bower.json')
    .pipe(bump({
      type: releaseType()
    }))
    .pipe(gulp.dest('.'))
    .pipe(tap(function (file) {
      return build(version(file))
    }));
});

gulp.task('commit', ['build'], function () {

  return gulp.src(['bower.json', 'dist/relate.min.js'])
    .pipe(git.commit('Bump version for ' + releaseType() + ' release ' + version()))
    .pipe(tag({
      prefix: '',
      version: version(),
    }));
});

gulp.task('release', ['commit'], function() {

  git.push('origin', 'master', function (err) {
    if (err) throw err;

    git.push('origin', 'master', {args: ' --tags'}, function (err) {
      if (err) throw err;
    });
  });
});
