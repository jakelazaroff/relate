var vendor = require('./vendor');

var Relate = require('../src/relate.js');
var data = require('./data.js');

describe('Black Box', function () {

  it('should be defined as a global object', function () {
    expect(Relate).to.exist;
  });

  describe('Importing', function () {

    beforeEach(function () {
      setup();
    });

    it('should create collections using the data root keys as names', function () {

      var collections = Object.keys(Relate.collections);

      collections.should.eql(Object.keys(data));
      collections.forEach(function (name) {
        Relate.collections[name].should.be.an.instanceOf(Relate.Collection);
      });
    });
  });

  describe('Item', function () {

    describe('Getters', function () {

      it('should return the related item if one exists', function () {
        setup({}, {
          artists: [
            {
              id: 1,
              name: 'Turnover',
              songs: [1],
            }
          ],
          songs: [
            {
              id: 1,
              name: 'Most Of The Time',
              artists: 1
            }
          ]
        });

        var artist = Relate.collection('songs').get(1).get('artists');

        artist.should.equal(
          Relate.collection('artists').get(
            artist.id
          )
        );
      });

      it('should return an array of related items if more than one exists', function () {
        setup();

        var songs = Relate.collection('artists').get(1).get('songs');

        songs.should.eql(
          Relate.collection('songs').get(
            songs.map(function (song) {
              return song.id;
            })
          )
        );
      });

      it('should use a mapped key if one exists', function () {
        setup({
          map: {
            songs: {artist: 'artists'}
          }
        });

        var artist = Relate.collection('songs').get(1).get('artist');

        artist.should.equal(
          Relate.collection('artists').get(
            artist.id
          )
        );
      });

      it('should return the key\'s value if it\'s not a relation', function () {
        setup();

        Relate.collection('songs').get(1).get('title').should.equal('Most Of The Time');
      });

      it('should return the key\'s value if the key is a collection that\'s been mapped elsewhere', function () {
        setup({
          map: {
            songs: {artist: 'artists'}
          }
        });

        var value = 'test',
            song = Relate.collection('songs').get(1);

        song.artists = value;

        song.get('artists').should.equal(value);
      });
    });
  });
});

// setup and teardown functions

var originals = {
  defaultTransform: Relate.defaultTransform,
  mixin: true
};

function setup (options, dataset) {

  teardown();

  for (var option in options)
    if (typeof options[option] === 'object')
      for (var prop in options[option])
        Relate[option][prop] = options[option][prop];
    else
      Relate[option] = options[option];

  Relate.import(dataset || data);
};

function teardown () {
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
