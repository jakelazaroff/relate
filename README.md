# Relate

[![Bower version](https://badge.fury.io/bo/relate.svg)](http://badge.fury.io/bo/relate)

**Relate** is a tiny client-side relational document store. It's useful for web applications with static data for which there are still relationships — for example, a record label might have a website in which there are artists, albums and songs, all of which relate to each other.

### Dependencies

None! :tada:

### Installation

`bower install --save relate`

### Documentation

#### Relate

##### .import(data)

Takes an object and populates the Relate datastore. The object's keys are used as the collection names; the values are arrays of objects used as collection entities. Each entity must have an attribute `id` unique within its collection.

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

##### .transform

An object containing transformation functions to be executed on each entity as it's imported into a collection, allowing entities to be instantiated as other classes. The keys of `Relate.transform` correspond to collection names. The transformation function receives the entity's raw properties as its argument and must return an object to be used as the entity.

Transforms must be set before data is imported.

```javascript
var Artist = function () { /* ... */ };

Relate.transform.artists = function (entity) { return new Artist(entity); };
```

##### .map

An object containing mappings between entity keys and collection names, allowing entities to use a key other than the name of a collection to retrieve the related entity in that collection. The keys of `Relate.map` correspond  to collection names. The keys of the collection's map correspond to properties on an entity in that collection, while the values correspond to the target collection.

```javascript
Relate.map.songs = { artist: 'artists' };
```

#### Collection

#### Entity
