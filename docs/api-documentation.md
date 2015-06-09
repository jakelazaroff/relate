# API Documentation

## Relate

**Relate** is the library object. It provides methods for importing data; configuring, creating and retrieving collections; as well as a few flags and utility methods. Any of the classes contained in Relate can be instantiated on their own, but since Relate depends on a centralized data store to function, most interaction with the library should be done through the Relate object.

### .import(data)

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

## .collection(name)

Returns the collection named `name`, or throws an error if it doesn't exist.

```javascript
Relate.collection('artists');
// Relate.Collection {name: "artists", store: Object, add: function…}
```

### .collection.create(name[, options])

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

### .map

An object containing mappings between item properties and collection names. The keys in `Relate.map` correspond  to collection names. Each property in the collection's map object corresponds to a property on that collection's items, and each value corresponds to the name of the target collection.

```javascript
Relate.map.songs = { artist: 'artists' };
```

### .mixin

A boolean flag used to determine whether `Item` methods are mixed in after an item is transformed. Defaults to true.

:exclamation: Should not be set to `false` unless `Item` methods are manually applied in a transform.

### .noConflict()

If it was set on a global object, restores `Relate` to its prior value and returns it.

### .transform

An object containing transformation functions executed on each item as it's imported into a collection. The properties in `Relate.transform` correspond to collection names. The transformation function receives the item's raw properties and the collection to which it will be added, and must return an object to be used as the item.

Transforms must be set before data is imported.

```javascript
var Artist = function () { /* ... */ };

Relate.transform.artists = function (item, collection) { return new Artist(item); };
```

### .defaultTransform

A transformation function executed for every collection, unless that collection has a specific transformation function set in `Relate.transform`.

## Collection

**Collections** are stores for items of the same type. They provide methods for importing and retrieving items stored within. Each collection has a unique name, as well as a map that allows item properties to be mapped to arbitrary collections and a transform function that alters items as they're imported.

### Collection(name[, options])

Creates a collection named `name` and returns it, or throws an error if a collection with that name already exists.

- **transform**: a transformation function executed on each item added to the collection
- **map**: an object mapping properties on the collection's items to other collections

:exclamation: If a collection is created directly using the constructor, other collections and items will not be able to access it. Use `Relate.collection.create` instead.

### .add(item)

Given an object `item`, executes the collection's transformation function on it, mixes in the `Item` methods, adds it to the collection and returns it. If an item with the same ID already exists in the collection, throws an error.

:exclamation: `Collection.import` will iterate over an array of items and add them automatically.

```javascript
Relate.collection('artists').add({
  id: 1,
  name: 'Turnover',
  songs: [1, 2]
});
```

### .get(query)

If `query` is an ID, returns the corresponding item in the collection. If `query` is an array of IDs, returns an array of the corresponding items in the collection. If `query` is a hash, returns an array of all items in the collection with matching keys and values.

```javascript
Relate.collection('songs').get(1);
// Song {id: 1, name: "Most Of The Time", artist: 1, relate: Object}
Relate.collection('songs').get([1, 2]);
// [Song {id: 1, name: "Most Of The Time"…}, Song {id: 2, name: "New Scream"…}]
Relate.collection('songs').get({ name: 'New Scream' });
// [Song {id: 2, name: "New Scream"…}]
```

### .import(items)

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

### .map()

Returns a map of all mapped keys to collection names, mapping the collection name to itself if a mapping for that collection is undefined.

```javascript
Relate.map.songs = { artist: 'artists' };

Relate.collection('songs').map();
// {
//   artist: 'artists',
//   songs: 'songs'
// }
```

## Item

**Items** are the bread and butter of Relate. Each one is an object in a collection, holding both data from a dataset as well as Relations that describe how it relates to other items. Item methods are the programmer's interface to these relationships. These are mixed in on top of the objects that come directly from the dataset.

### .get(key)

Given a property `key` that exists on an item, returns either the related item in the corresponding collection or property's value.

```javascript
Relate.collection('songs').get(1).get('name');
// "Most Of The Time"
Relate.collection('songs').get(1).get('artist');
// Artist {id: 1, name: "Turnover", songs: Array[2], relate: Object}
```

### .prefix

A string used as a namespace for `Item` methods copied to items. Used to prevent conflicts between `Item` methods and properties that already exist in items.

```javascript
Relate.Item.prefix = 'relate';

Relate.collection('songs').get(1).relate.get('artist');
// Artist {id: 1, name: "Turnover", songs: Array[2], relate: Object}
```

## Relation

**Relations** are used to implement relationships between items. Assigned to item properties that correspond to collections, it is instantiated with the IDs of the related items and a reference to the collection in which they're stored.

By default, Relation only provides a method for accessing the related items; however, it can be extended to provide more advanced functionality.

### .init(collection, related)

Called when a Relation is instantiated. Stores the passed collection and IDs of related items as members.

### .collection

A reference to the collection in which the related items are stored.

### .related

The ID (or IDs) of the related items.

### .get()

Returns the related items from their collection.
