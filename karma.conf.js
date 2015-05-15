module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha', 'chai', 'browserify'],
    reporters: ['mocha'],
    files: [
      __dirname + 'bower_components/*.js',
      __dirname + '/src/relate.js',
      __dirname + '/test/*.js'
    ],
    preprocessors: {
      'test/*.js': [ 'browserify' ],
      'bower_components/*.js': [ 'browserify' ]
    },
  });
};
