require('./vendor');

var Relate = require('../src/relate.js');

var utils = require('./utils.js').create(Relate),
    setup = utils.setup,
    clone = utils.clone;

var data;

describe('API', function () {

  describe('Relate', function () {
    describe('.collection', function () {

      beforeEach(function () {
        data = setup();
      });

      it('should return the collection with the given name if one exists', function () {

        var artists = Relate.collection('artists');
        artists.name.should.equal('artists');
        artists.should.be.an.instanceOf(Relate.Collection);
      });
      it('should return undefined if no collection with the given name exists', function () {

        should.not.exist(Relate.collection('musicians'));
      });
    });
    describe('.collection.create', function () {

      var dataset = function () { return clone([{id: 1, artist: 1}]) };
      var transform = function (item) { return item; },
          calledTransform = sinon.spy(transform),
          fallbackTransform = sinon.spy(transform);

      function setupTransforms (options) {
        data = setup(options);

        calledTransform.reset();
        fallbackTransform.reset();
      }

      beforeEach(function () {
        data = setup();
      });

      it('should create a collection with the given name if none exists', function () {

        Relate.collection.create('musicians');

        var musicians = Relate.collection('musicians');
        musicians.name.should.equal('musicians');
        musicians.should.be.an.instanceOf(Relate.Collection);
      });
      it('should create a collection with the given transform function', function () {

        setupTransforms({
          transform: {musicians: fallbackTransform},
          defaultTransform: fallbackTransform
        });

        Relate.collection.create('musicians', {
          transform: calledTransform
        }).import(dataset());

        calledTransform.should.be.called;
        fallbackTransform.should.not.be.called;
      });
      it('should fall back to Relate.transform.NAME if no transform is passed', function () {

        setupTransforms({
          transform: {musicians: calledTransform},
          defaultTransform: fallbackTransform
        });

        Relate.collection.create('musicians').import(dataset());

        calledTransform.should.be.called;
        fallbackTransform.should.not.be.called;
      });
      it('should fall back to Relate.defaultTransform if Relate.transform.NAME is undefined', function () {

        setupTransforms({
          defaultTransform: calledTransform
        });

        Relate.collection.create('musicians').import(dataset());

        calledTransform.should.be.called;
      });
      it('should create a collection with the given map', function () {

        data = setup({
          map: {musicians: {artist: 'songs'}}
        });

        Relate.collection.create('musicians', {
          map: {artist: 'artists'}
        }).import(dataset());

        Relate.collection('musicians').get(1).get('artist').should.equal(
          Relate.collection('artists').get(1)
        );
      });
      it('should fall back to Relate.map.NAME if no map is passed', function () {

        data = setup({
          map: {musicians: {artist: 'artists'}}
        });

        Relate.collection.create('musicians').import(dataset());

        Relate.collection('musicians').get(1).get('artist').should.equal(
          Relate.collection('artists').get(1)
        );
      });
      it('should return the newly created collection', function () {

        var musicians = Relate.collection.create('musicians');
        musicians.should.equal(Relate.collection('musicians'));
      });
      it('should throw an error if a collection with the given name already exists', function () {

        expect(function () { Relate.collection.create('artists'); }).to.throw();
      });
    });
    describe('.defaultTransform', function () {

      var transform = sinon.spy(function(item) { return item; });

      function checkTransform (items) {
        items.forEach(function (item) {
          transform.should.be.calledWith(item);
        });
      }

      afterEach(function () {
        transform.reset();
      });

      it('should be called once for each item imported', function () {

        data = setup({
          defaultTransform: transform
        });

        transform.callCount.should.equal(data.artists.length + data.songs.length);
        checkTransform(data.artists);
        checkTransform(data.songs);
      });
    });
    describe('.import', function () {

      beforeEach(function () {
        data = setup();
      });

      it('should create collections using the data root keys as names', function () {

        var collections = Object.keys(data);

        collections.should.eql(Object.keys(Relate.collections));
        collections.forEach(function (name) {
          Relate.collection(name).should.be.an.instanceOf(Relate.Collection);
        });
      });
      it('should create items in the collections using their IDs as keys', function () {

        Object.keys(data).forEach(function (name) {
          data[name].forEach(function (item) {
            Relate.collection(name).get(item.id).should.equal(item);
          });
        });
      });
      // TODO: should apply maps defined in Relate.map
      // TODO: should appy transforms defined in Relate.transform
      // TODO: should apply default transform defined in Relate.defaultTransform
    });
    describe('.transform', function () {

      var transform = function(item) { return item; },
          artistTransform = sinon.spy(transform),
          songTransform = sinon.spy(transform);

      function checkTransform (transform, items) {
        transform.callCount.should.equal(items.length);
        items.forEach(function (item) {
          transform.should.be.calledWith(item);
        });
      }

      afterEach(function () {
        artistTransform.reset();
        songTransform.reset();
      });

      it('should be called once for each item added to the corresponding collection', function () {

        data = setup({
          transform: {
            artists: artistTransform,
            songs: songTransform
          }
        });

        checkTransform(artistTransform, data.artists);
        checkTransform(songTransform, data.songs);
      });

      it('should take precedence over Relate.defaultTransform', function () {

        data = setup({
          transform: {
            artists: artistTransform
          },
          defaultTransform: songTransform
        });

        checkTransform(artistTransform, data.artists);
        data.artists.forEach(function (item) {
          songTransform.should.not.be.calledWith(item);
        });
      });
    });
  });

  describe('Collection', function () {
    describe('.get', function () {
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
    describe('.get', function () {
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
      it('if the key is mapped to a collection, should return items from the mapped collection', function () {
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
      it('should return the key\'s value if the key is the name of a collection that\'s been mapped elsewhere', function () {
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

  describe('Relation', function () {
    describe('.get', function () {
      it('should return the related item from its collection', function () {

        data = setup();

        new Relate.Relation(Relate.collection('artists'), 1).get().should.equal(data.artists[0]);
      });
    });
  });
});
