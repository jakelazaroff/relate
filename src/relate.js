;(function (root) {

  var keys = Object.keys,
      isArray = Array.isArray;

  var Relate = {};

  Relate.VERSION = '0.2.3';

  var transform = Relate.transform = {};
  var map = Relate.map = {};

  // Relate.Collection

  var Collection = Relate.Collection = function (name) {
    var self = this,
        options = options || {};

    self.name = name;
    self.store = {};

    self.transform = transform[name];
    self.map = map[name] || {};
  };

  Collection.prototype.add = function (entity) {
    var self = this;

    if (self.store[entity.id])
      throw new Error('Entity with id ' + entity.id + ' already exists in collection "' + self.name + '".');

    if (self.transform)
      entity = self.transform(entity);

    Relate.mixin(entity, self);

    self.store[entity.id] = entity;
  };

  Collection.prototype.import = function (entities) {
    var self = this;

    entities.forEach(function (entity) {
      self.add(entity);
    });
  };

  Collection.prototype.mapped = function (key) {
    var self = this;

    return keys(self.map)
      .map(function (key) {
        return self.map[key];
      }).indexOf(key) !== -1;
  };

  Collection.prototype.key = function (key) {
    var self = this;

    if (self.map[key])
      return self.map[key];
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
    else
      return self.store[query];
  };

  var collections = Relate.collections = {};

  Relate.collection = function (name) {
    if (!Relate.collection.exists(name))
      throw new Error('Collection "' + name + '" does not exist.');
    
    return collections[name]; 
  };

  Relate.collection.create = function (name) {
    if (Relate.collection.exists(name))
      throw new Error('Collection "' + name + '" already exists.');
    
    collections[name] = new Collection(name);
    return collections[name];
  };

  Relate.collection.exists = function (name) {
    return name && name in collections;
  };

  Relate.import = function (data) {
    keys(data).forEach(function (collection) {
      Relate.collection.create(collection).import(data[collection]);
    });
  };

  // Relate.Entity

  var Entity = Relate.Entity = {};

  Entity.get = function (key) {
    var self = this,
        collection = self.collection.key(key);

    if (collection)
      return Relate.collection(collection).get(self[key]);
    else
      return self[key];
  };

  Relate.mixin = function (entity, collection) {
    entity.get = Entity.get;
    entity.collection = collection;
  };

  var _Relate = root.Relate;

  Relate.noConflict = function () {
    root.relate = _Relate;
    return Relate;
  };

  if (typeof define === 'function' && define.amd)
    define([], function () {
      return Relate;
    });
  else
    root.Relate = Relate;

})(this);
