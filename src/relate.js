;(function (root) {
  'use strict';

  // cache functions for later use
  var keys = Object.keys,
      isArray = Array.isArray,
      isObject = function (obj) { return typeof obj === 'object' && !!obj; },
      isFunction = function (func) { return typeof func === 'function' && !!func; };

  // create the global relate object
  var Relate = {};

  Relate.VERSION = '/*VERSION*/'; // automatically generated in build process

  // Maps

  var map = Relate.map = {};

  Relate._map = function (map) {

    var mapped = {},
        results = {};

    keys(map || {}).forEach(function (key) {
      mapped[map[key]] = true;
      results[key] = map[key];
    });

    keys(Relate.collections).forEach(function (name) {
      if (!mapped[name])
        results[name] = name;
    });

    return results;
  };

  // Transforms

  var transform = Relate.transform = {};
  Relate.defaultTransform = function (item, collection) { return item; };

  // Relate.Collection

  var Collection = Relate.Collection = function (name, options) {
    var self = this;
    options = options || {};

    self.name = name;
    self.store = {};

    self._map = options.map || {};
    self._transform = options.transform;
  };

  Collection.prototype.map = function () {
    var self = this;

    return Relate._map(self._map);
  };

  Collection.prototype.add = function (item) {
    var self = this;

    if (self.store[item.id])
      throw new Error('Item with id ' + item.id + ' already exists in collection "' + self.name + '".');

    item = self._transform(item, self);

    if (Relate.mixin)
      Relate._mixin(item, self);

    return (self.store[item.id] = item);
  };

  Collection.prototype.import = function (items) {
    var self = this;

    items.forEach(function (item) {
      self.add(item);
    });
  };

  Collection.prototype.get = function (query) {
    var self = this;

    if (isArray(query))
      return query.map(function (id) {
        return self.store[id];
      });
    else if (isFunction(query))
      return self.get(
        keys(self.store).filter(function (id) {
          return query(self.store[id]);
        })
      );
    else if (isObject(query))
      return self.get(
        keys(self.store).filter(function (id) {
          for (var key in query)
            if (query[key] !== self.store[id][key])
              return false;
          return true;
        })
      );
    else
      return self.store[query];
  };

  var collections = Relate.collections = {};

  Relate.collection = function (name) {
    if (!Relate.collection.exists(name))
      throw new Error('Collection "' + name + '" does not exist.');

    return collections[name];
  };

  Relate.collection.create = function (name, options) {
    if (Relate.collection.exists(name))
      throw new Error('Collection "' + name + '" already exists.');

    options = options || {};

    collections[name] = new Collection(name, {
      transform: options.transform || transform[name] || Relate.defaultTransform,
      map: options.map || map[name]
    });
    return collections[name];
  };

  Relate.collection.exists = function (name) {
    return name && name in collections;
  };

  Relate.import = function (data) {
    keys(data).map(function (name) {
      return Relate.collection.create(name);
    }).forEach(function (collection) {
      collection.import(data[collection.name]);
    });
  };

  // Relate.Relation

  var Relation = Relate.Relation = function () {
    if (this.init)
      this.init.apply(this, arguments);
  };

  Relation.prototype.related = undefined;

  Relation.prototype.init = function (collection, related) {
    var self = this;

    self.collection = collection;

    if (related)
      self.related = related;
  };

  Relation.prototype.get = function () {
    var self = this;

    return self.collection.get(self.related);
  };

  // Relate.Item

  var Item = Relate.Item = {};

  Item.prefix = undefined;

  Item.get = function (key) {
    var self = this,
        value = self[key];

    if (value instanceof Relation)
      return value.get();
    else
      return value;
  };

  Relate.mixin = true;

  Relate._mixin = function (item, collection) {

    var map = collection.map();

    keys(map).forEach(function (property) {
      if (item[property])
        item[property] = new Relation(
          Relate.collection(map[property]),
          item[property]
        );
    });

    var destination = Item.prefix ? item[Item.prefix] = {} : item;

    ['get'].forEach(function (method) {
      destination[method] = Item[method].bind(item);
    });
  };

  var _Relate = root.Relate;

  Relate.noConflict = function () {
    root.relate = _Relate;
    return Relate;
  };

  if (typeof define === 'function' && define.amd)
    define([], function () { return Relate; });
  else if (typeof module !== 'undefined' && module.exports)
    module.exports = Relate;
  else
    root.Relate = Relate;

})(this);
