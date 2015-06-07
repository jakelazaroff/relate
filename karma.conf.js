module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha', 'chai-things', 'sinon-chai', 'sinon', 'chai', 'browserify'],
    reporters: ['mocha', 'coverage'],
    files: [
      __dirname + '/src/relate.js',
      __dirname + '/test/*.js'
    ],
    preprocessors: {
      'src/relate.js': ['coverage'],
      'test/*.js': ['browserify'],
      'bower_components/*.js': ['browserify']
    },
  });
};
