# Relate

[![Bower version](https://badge.fury.io/bo/relate.svg)](http://badge.fury.io/bo/relate)

**Relate** is a tiny client-side relational document store. It's useful for web applications with static data for which there are still relationships — for example, a record label might have a website in which there are artists, albums and songs, all of which relate to each other.

## Dependencies

None! :tada:

## Installation

`bower install --save relate`

## Documentation

### Relate

#### .import(data)

Takes an object and populates the Relate datastore. The root object's properties are used as the collection names; its values are arrays of objects used as collection entities. Each entity must have an attribute `id` unique within its collection.

```javascript
Relate.import({
  artists: [
    {
      id: 1,
      name: 'Turnover',
      songs: [1, 2]
    }
  ],
  songs: [
    {
      id: 1,
      name: 'Most Of The Time',
      artist: 1
    },
    {
      id: 2,
      name: 'New Scream',
      artist: 1
    }
  ]
});
```

#### .collection(name)

Returns the collection named `name`, or throws an error if it doesn't exist.

```javascript
Relate.collection('artists');
// Relate.Collection {name: "artists", store: Object, transform: function, map: Object, add: function…}
```

#### .collection.create(name[, options])

Creates a collection named `name` and returns it, or throws an error if a collection with that name already exists.

- **transform**: a transformation function executed on each entity added to the collection
- **map**: an object mapping properties on the collection's entities to other collections

:speech_balloon: Shouldn't need to be called manually, since `Relate.import` will create collections automatically.

```javascript
var Song = function () { /* ... */ };

Relate.collection.create('songs', {
  map: { artist: 'artists' },
  transform: function (entity) { return new Artist(entity); }
});
// Relate.Collection {name: "songs", store: Object, transform: function, map: Object, add: function…}
```

#### .collection.exists(name)

Returns true if a collection named `name` exists, or false if it doesn't.

```javascript
Relate.collection.exists('artists');
// true
Relate.collection.exists('labels');
// false
```

#### .map

An object containing mappings between entity properties and collection names. The keys in `Relate.map` correspond  to collection names. Each property in the collection's map object corresponds to a property on that collection's entities, and each value corresponds to the name of the target collection.

```javascript
Relate.map.songs = { artist: 'artists' };
```

#### .mixin(entity, collection)

Copies the methods defined in `Entity` to `entity`, binding `entity` and `collection` to each method as `this` and the first argument, respectively. If `Entity.prefix` is defined, creates an object with that property on `entity` and copies the method there, instead of directly on `entity` itself.

:speech_balloon: Shouldn't need to be called manually, since `Collection.add` will mix in `Entity` methods automatically.

#### .noConflict()

If it was set on a global object, restores `Relate` to its prior value and returns it.

#### .transform

An object containing transformation functions executed on each entity as it's imported into a collection. The properties in `Relate.transform` correspond to collection names. The transformation function receives the entity's raw properties as its argument and must return an object to be used as the entity.

Transforms must be set before data is imported.

```javascript
var Artist = function () { /* ... */ };

Relate.transform.artists = function (entity) { return new Artist(entity); };
```

### Collection

#### Collection(name[, options])

Creates a collection named `name` and returns it, or throws an error if a collection with that name already exists.

- **transform**: a transformation function executed on each entity added to the collection
- **map**: an object mapping properties on the collection's entities to other collections

:bangbang: If a collection is created directly using the constructor, other collections and entities will not be able to access it. Use `Relate.collection.create` instead.

#### .add(entity)

Given an object `entity`, executes the collection's transformation function on it, mixes in the `Entity` methods and adds it to the collection. If an entity with the same ID already exists in the collection, throws an error.

:speech_balloon: Shouldn't need to be called manually, since `Collection.import` will iterate over the array of entities and add them.

```javascript
Relate.collection('artists').add({
  id: 1,
  name: 'Turnover',
  songs: [1, 2]
});
```

#### .get(query)

If `query` is an ID, returns the corresponding entity in the collection; if `query` is an array, returns an array thereof. 

```javascript
Relate.collection('songs').get(1);
// Song {id: 1, name: "Most Of The Time", artist: 1, relate: Object}
Relate.collection('songs').get([1, 2]);
// [Song {id: 1, name: "Most Of The Time"…}, Song {id: 2, name: "New Scream"…}]
```

#### .import(entities)

Takes an array and populates the collection. Each object in the array is used as an entity and must have a unique attribute `id`.

:speech_balloon: Shouldn't need to be called manually, since `Relate.import` will import each array of entities into a collection automatically.

```javascript
Relate.collection('songs').import([
  {
    id: 1,
    name: 'Most Of The Time',
    artist: 1
  },
  {
    id: 2,
    name: 'New Scream',
    artist: 1
  }
]);
```

#### .key(key)

Returns the collection name mapped to property `key`, if it exists, or returns `key` if it corresponds to an unmapped collection. Otherwise, returns `undefined`.

```javascript
Relate.map.songs = { artist: 'artists' };

Relate.collection('songs').key('artist');
// "artists"
Relate.collection('songs').key('songs');
// "songs"
Relate.collection('songs').key('name');
// undefined
```

#### .mapped(key)

Returns true if a mapping exists in the collection for property `key`, or false if it does not.

```javascript
Relate.map.songs = { artist: 'artists' };

Relate.collection('songs').key('artist');
// true
Relate.collection('songs').key('songs');
// false
```

### Entity

#### .get(key)

Given a property `key` that exists on an entity, returns either the related entity in the corresponding collection or property's value. 

```javascript
Relate.collection('songs').get(1).get('name');
// "Most Of The Time"
Relate.collection('songs').get(1).get('artist');
// Artist {id: 1, name: "Turnover", songs: Array[2], relate: Object}
```

#### .prefix

A string used as a namespace for `Entity` methods copied to entities. Used to prevent conflicts between `Entity` methods and properties that already exist in entities.

```javascript
Relate.Entity.prefix = 'relate';

Relate.collection('songs').get(1).relate.get('artist');
// Artist {id: 1, name: "Turnover", songs: Array[2], relate: Object}
```
