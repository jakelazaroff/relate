;(function (root) {
  'use strict';

  var keys = Object.keys,
      isArray = Array.isArray,
      isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
      };

  var Relate = {};

  Relate.VERSION = '0.6.3';

  var transform = Relate.transform = {};
  var defaultTransform = Relate.defaultTransform = function (item, collection) { return item; };

  var map = Relate.map = {};

  // Relate.Collection

  var Collection = Relate.Collection = function (name, options) {
    var self = this,
        options = options || {};

    self.name = name;
    self.store = {};

    self._transform = options.transform;
    self._map = options.map || {};
  };

  Collection.prototype.add = function (item) {
    var self = this;

    if (self.store[item.id])
      throw new Error('Item with id ' + item.id + ' already exists in collection "' + self.name + '".');

    item = self._transform(item, self);
    Relate._mixin(item, self);

    return self.store[item.id] = item;
  };

  Collection.prototype.import = function (items) {
    var self = this;

    items.forEach(function (item) {
      self.add(item);
    });
  };

  Collection.prototype.mapped = function (key) {
    var self = this;

    return keys(self._map)
      .map(function (key) {
        return self._map[key];
      }).indexOf(key) !== -1;
  };

  Collection.prototype.key = function (key) {
    var self = this;

    if (self._map[key])
      return self._map[key];
    else if (Relate.collection.exists(key) && !self.mapped(key))
      return key;
    else
      return undefined;
  };

  Collection.prototype.get = function (query) {
    var self = this;

    if (isArray(query))
      return query.map(function (id) {
        return self.store[id];
      });
    else if (isObject(query))
      return self.get(
        keys(self.store).filter(function (id) {
          var item = self.store[id];
          for (var key in query)
            if (query[key] !== item[key])
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
      transform : options.transform || transform[name] || Relate.defaultTransform,
      map : options.map || map[name]
    });
    return collections[name];
  };

  Relate.collection.exists = function (name) {
    return name && name in collections;
  };

  Relate.import = function (data) {
    keys(data).forEach(function (collection) {
      Relate.collection.create(collection)
        .import(data[collection]);
    });
  };

  // Relate.Item

  var Item = Relate.Item = {};

  Item.prefix = undefined;

  Item.get = function (collection, key) {
    var self = this,
        name = collection.key(key);

    if (name)
      return Relate.collection(name).get(self[key]);
    else
      return self[key];
  };

  Relate._mixin = function (item, collection) {

    var destination = Item.prefix ? item[Item.prefix] = {} : item;

    ['get'].forEach(function (method) {
      destination[method] = Item[method].bind(item, collection);
    });
  };

  var _Relate = root.Relate;

  Relate.noConflict = function () {
    root.relate = _Relate;
    return Relate;
  };

  if (typeof define === 'function' && define.amd)
    define([], function () { return Relate; });
  else if (typeof exports !== 'undefined')
    exports.Relate = Relate;
  else
    root.Relate = Relate;

})(this);
