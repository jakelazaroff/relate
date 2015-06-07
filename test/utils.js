var Relate;
var data = require('./data.js');

var originals = {};
var createOriginals = function () {
  originals.defaultTransform = Relate.defaultTransform;
  originals.mixin = Relate.mixin;
};

var setup = function (options, dataset) {
  teardown();
  dataset = clone(dataset || data);

  for (var option in options)
    if (typeof options[option] === 'object')
      for (var prop in options[option])
        Relate[option][prop] = options[option][prop];
    else
      Relate[option] = options[option];

  Relate.import(dataset);

  return dataset;
};

var teardown = function () {
  [
    Relate.collections,
    Relate.map,
    Relate.transform
  ].forEach(function (obj) {
    for (var prop in obj)
      delete obj[prop];
  });

  Object.keys(originals).forEach(function(prop) {
    Relate[prop] = originals[prop];
  });
};

var clone = function (json) {
  return JSON.parse(JSON.stringify(json));
};

module.exports = {
  create: function (_Relate) {
    Relate = _Relate;
    createOriginals();

    return {
      setup: setup,
      teardown: teardown,
      clone: clone
    }
  }
};
