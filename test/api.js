require('./vendor');

var Relate = require('../src/relate.js');

var utils = require('./utils.js').create(Relate),
    setup = utils.setup;

var data;

describe('API', function () {

  describe('Importing', function () {

    beforeEach(function () {
      data = setup();
    });

    it('should create collections using the data root keys as names', function () {

      var collections = Object.keys(Relate.collections);

      collections.should.eql(Object.keys(data));
      collections.forEach(function (name) {
        Relate.collections[name].should.be.an.instanceOf(Relate.Collection);
      });
    });
  });

  describe('Collection', function () {

    describe('Getters', function () {

      it('should return an item when passed an ID', function () {
        data = setup();

        Relate.collection('artists').get(1).should.equal(data.artists[0]);
      });

      it('should return undefined when passed an ID not in the collection', function () {
        data = setup();

        should.not.exist(Relate.collection('artists').get(0));
      });

      it('should return an array of items when passed an array of IDs', function () {
        data = setup();

        var artists = Relate.collection('artists').get([1, 2]);

        artists.length.should.equal(2);
        artists.forEach(function (artist, index) {
          artists[index].should.equal(data.artists[index]);
        });
      });

      it('should return an array of matching items when passed a predicate function', function () {
        data = setup({
          map: {
            songs: {artist: 'artists'}
          }
        });

        var songs = Relate.collection('songs').get(function (item) {
          return item.get('artist').get('name') === 'Turnover';
        });

        songs.length.should.equal(2);
        songs.should.include.something.that.equals(data.songs[0]);
        songs.should.include.something.that.equals(data.songs[1]);

        songs.should.not.include.something.that.equals(data.songs[3]);
        songs.should.not.include.something.that.equals(data.songs[4]);
      });

      it('should return an array of matching items when passed an object', function () {
        data = setup({
          map: {
            songs: {artist: 'artists'}
          }
        });

        var artist = Relate.collection('artists').get(1),
            songs = Relate.collection('songs').get({artist: artist});

        songs.length.should.equal(2);
        songs.should.include.something.that.equals(data.songs[0]);
        songs.should.include.something.that.equals(data.songs[1]);

        songs.should.not.include.something.that.equals(data.songs[3]);
        songs.should.not.include.something.that.equals(data.songs[4]);
      });
    });
  });

  describe('Item', function () {

    describe('Getters', function () {

      it('should return the related item if one exists', function () {
        data = setup({}, {
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
        data = setup();

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
        data = setup({
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

      it('should allow multiple keys to be mapped to the same collection', function () {
        data = setup({
          map: {
            songs: {artist: 'artists', composer: 'artists'}
          }
        }, {
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
              artist: 1,
              composer: 1
            }
          ]
        });

        var song = Relate.collection('songs').get(1);

        song.get('artist').should.equal(
          song.get('composer')
        );
      });

      it('should return the key\'s value if it\'s not a relation', function () {
        data = setup();

        Relate.collection('songs').get(1).get('title').should.equal('Most Of The Time');
      });

      it('should return the key\'s value if the key is a collection that\'s been mapped elsewhere', function () {
        data = setup({
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
