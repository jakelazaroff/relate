# Getting Started

To explore what Relate can do, let's build a music application. The two types of items in our application are **artists** and **songs**. Artists can have any number of songs, but songs can only belong to one artist.

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

## Importing

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

Each item has a method `get` that will return either the value of the property passed, or the related item from its collection. Calling `get('artists')` on a song will return its related artist, while calling `get('name')` on that artist will return its name.

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

## Maps

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

##  Transforms

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

## Further Reading

You've reached the end of this introduction, but not of what Relate can do! Check out the [API Documentation](https://github.com/jakelazaroff/relate/blob/master/docs/api-documentation.md) and dive a little deeper.
