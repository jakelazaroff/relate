# Relate

[![Bower version](https://badge.fury.io/bo/relate.svg)](http://badge.fury.io/bo/relate)

**Relate** is a tiny client-side relational datastore. It's useful for web applications with static relational data, allowing you to import JSON data, create collections of objects, define relations between them, and easily traverse the relationship graph from your application code. **Relate** is lightweight, dependency-free and framework-agnostic, easily compatible with applications built with Angular, React and more.

Note that while objects and their relationships can be modified, **Relate** works best with a predefined dataset that doesn't change during an application's runtime. If your application involves changing data, consider a more robust relational framework such as [Backbone](http://backbonejs.org) paired with [Backbone-relational](http://backbonerelational.org).

## Dependencies

None! :tada:

## Installation

Install manually: just copy `src/relate.js` wherever you'd like.

Install using Bower:

```
bower install --save relate
```

Load in a browser:

```html
<script src="relate.js"></script>
```

Load using Node.js

```javascript
var Relate = require('Relate');
```

Load using AMD:

```javascript
require(['Relate'], function (Relate) {
  // ...
});
```

## Getting Started

Let's build a music application. The two types of items in our application are **artists** and **songs**. Artists can have any number of songs, but songs can only belong to one artist.

Based on these requirements, our dataset might look something like this:

```javascript
var dataset = {
  artists: [
    {
      id: 1,
      name: 'Turnover',
      songs: [1, 2]
    },
    {
      id: 2,
      name: 'Vinyl Theatre',
      songs: [3, 4]
    }
  ],
  songs: [
    {
      id: 1,
      name: 'Most Of The Time',
      artists: 1
    },
    {
      id: 2,
      name: 'New Scream',
      artists: 1
    },
    {
      id: 3,
      name: 'Breaking Up My Bones',
      artists: 2
    },
    {
      id: 4,
      name: 'Shaking In The Dead Of Night',
      artists: 2
    }
  ]
};
```

### Importing

To get this dataset ready to use, all we need is to import it into Relate:

```javascript
Relate.import(dataset);
```

That's it! Relate can now traverse our entire dataset. If we wanted to display the name of the artist of a song with a certain ID:

```javascript
var id = 1;
Relate.collection('songs').get(id).get('artists').get('name');
```

For each root-level key (in this example, `artists` and `songs`), `Relate.import` creates a collection in the dataset. Passing this key to `Relate.collection` returns the collection instance.

The value of each collection key must be an array that contains the collection items. Each item must have a property `id` with a value unique within the collection (so there could be an item in `songs` and `artists` with an `id` of `1`, but not two items in `artists`). Passing an `id` to `Collection.get` returns the item with that ID in that collection.

Each item has a method `get` that will return either the value of the property passed, or the related item from its collection. Calling `get('artists')` on a song will return its related artist,, while calling `get('name')` on that artist will return its name.

If one of the Item methods already exists as a property on your items, it'll be overwritten. To prevent this, you can set `Relate.Item.prefix`. Relate will create that property on each item and mix the methods in there.

```javascript
Relate.prefix = 'relate';
```

With this prefix, the code to get the artist name of a specific song becomes:

```javascript
Relate.collection('songs').get(1).relate.get('artist').relate.get('name');
```

If a prefix is set, it must be set before a dataset is imported.

That's not all, though. Relate has a couple more tricks up its sleeve.

### Maps

You might have noticed that in the last example, we called `get('artists')` on the song, even though each song can only have one artist. Relate lets you map keys on an item to collections:

```javascript
Relate.map.songs = {artist: 'artists'};
```

The mapped key must also replace the original in the dataset:

```javascript
var dataset = {
  artists: [
    // ...
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
    },
    {
      id: 3,
      name: 'Breaking Up My Bones',
      artist: 2
    },
    {
      id: 4,
      name: 'Shaking In The Dead Of Night',
      artist: 2
    }
  ]
};
```

Each property of `Relate.map` corresponds to the name of a collection, and each value is a map between the a property of the items in that collection and the collection they relate to.

With this map applied, the code to get the artist name of a specific song becomes:

```javascript
Relate.collection('songs').get(1).get('artist').get('name');
```

`get('artists')` is now `get('artist')`, matching the relationship between the two items.

Maps must be defined before a dataset is imported.

###  Transforms

By default, items are just objects with a few Relate methods (such as `get`) mixed in, but we may want to treat each item as a model and give it additional functionality. For example, if we wanted to add a player to our app, we would probably add a `play` method to our song items. We can do this using transforms:

```javascript
function Song (properties) { /* ... */ }
Song.prototype.play = function () { /* ... */ };
Relate.transform.songs = function (item) {
  return new Song(item);
};
```

Each property of `Relate.transform` corresponds to the name of a collection, and each value is a function that takes the item data and must return an item to be added in the collection. If the transform instantiates an object using the item data, it's usually a good idea to copy the item data to the new object, and the returned item **must** retain its `id` property.

To play a song after applying this transform:

```javascript
Relate.collection('songs').get(1).play();
```

Relate methods are mixed in after the transformation is applied, so unless a prefix is used, property names matching methods on the items will be overwritten.

To apply a transform to every collection, you can assign a function to `Relate.defaultTransform` instead of `Relate.transform`:

```javascript
function Model (properties) { /* ... */ }
Relate.defaultTransform = function (item) {
  return new Model(item);
};
```

You can define both a default transform and a transform for specific collections simultaneously; if a collection has its own transform, it will be used instead of the default.

Like maps, transforms must also be defined before a dataset is imported.

## Documentation

### Relate

#### .import(data)

Takes an object and populates the Relate datastore. The root object's properties are used as the collection names; its values are arrays of objects used as collection items. Each item must have an attribute `id` unique within its collection.

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
// Relate.Collection {name: "artists", store: Object, add: function…}
```

#### .collection.create(name[, options])

Creates a collection named `name` and returns it, or throws an error if a collection with that name already exists.

- **transform**: a transformation function executed on each item added to the collection
- **map**: an object mapping properties on the collection's items to other collections

:exclamation: `Relate.import` will create collections automatically.

```javascript
var Song = function () { /* ... */ };

Relate.collection.create('songs', {
  map: { artist: 'artists' },
  transform: function (item) { return new Artist(item); }
});
// Relate.Collection {name: "songs", store: Object, add: function…}
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

An object containing mappings between item properties and collection names. The keys in `Relate.map` correspond  to collection names. Each property in the collection's map object corresponds to a property on that collection's items, and each value corresponds to the name of the target collection.

```javascript
Relate.map.songs = { artist: 'artists' };
```

#### .noConflict()

If it was set on a global object, restores `Relate` to its prior value and returns it.

#### .transform

An object containing transformation functions executed on each item as it's imported into a collection. The properties in `Relate.transform` correspond to collection names. The transformation function receives the item's raw properties and the collection to which it will be added, and must return an object to be used as the item.

Transforms must be set before data is imported.

```javascript
var Artist = function () { /* ... */ };

Relate.transform.artists = function (item, collection) { return new Artist(item); };
```

#### .defaultTransform

A transformation function executed for every collection, unless that collection has a specific transformation function set in `Relate.transform`.

### Collection

#### Collection(name[, options])

Creates a collection named `name` and returns it, or throws an error if a collection with that name already exists.

- **transform**: a transformation function executed on each item added to the collection
- **map**: an object mapping properties on the collection's items to other collections

:bangbang: If a collection is created directly using the constructor, other collections and items will not be able to access it. Use `Relate.collection.create` instead.

#### .add(item)

Given an object `item`, executes the collection's transformation function on it, mixes in the `Item` methods, adds it to the collection and returns it. If an item with the same ID already exists in the collection, throws an error.

:exclamation: `Collection.import` will iterate over an array of items and add them automatically.

```javascript
Relate.collection('artists').add({
  id: 1,
  name: 'Turnover',
  songs: [1, 2]
});
```

#### .get(query)

If `query` is an ID, returns the corresponding item in the collection. If `query` is an array of IDs, returns an array of the corresponding items in the collection. If `query` is a hash, returns an array of all items in the collection with matching keys and values.

```javascript
Relate.collection('songs').get(1);
// Song {id: 1, name: "Most Of The Time", artist: 1, relate: Object}
Relate.collection('songs').get([1, 2]);
// [Song {id: 1, name: "Most Of The Time"…}, Song {id: 2, name: "New Scream"…}]
Relate.collection('songs').get({ name: 'New Scream' });
// [Song {id: 2, name: "New Scream"…}]
```

#### .import(items)

Takes an array and populates the collection. Each object in the array is used as an item and must have a unique attribute `id`.

:exclamation: `Relate.import` will import each arrays of items into collections automatically.

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

### Item

#### .get(key)

Given a property `key` that exists on an item, returns either the related item in the corresponding collection or property's value.

```javascript
Relate.collection('songs').get(1).get('name');
// "Most Of The Time"
Relate.collection('songs').get(1).get('artist');
// Artist {id: 1, name: "Turnover", songs: Array[2], relate: Object}
```

#### .prefix

A string used as a namespace for `Item` methods copied to items. Used to prevent conflicts between `Item` methods and properties that already exist in items.

```javascript
Relate.Item.prefix = 'relate';

Relate.collection('songs').get(1).relate.get('artist');
// Artist {id: 1, name: "Turnover", songs: Array[2], relate: Object}
```
