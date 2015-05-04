;(function (root) {

  var keys = Object.keys,
      isArray = Array.isArray,
      isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
      };

  var Relate = {};

  Relate.VERSION = '0.4.1';

  var transform = Relate.transform = {};
  var map = Relate.map = {};

  // Relate.Collection

  var Collection = Relate.Collection = function (name, options) {
    var self = this,
        options = options || {};

    self.name = name;
    self.store = {};

    self.transform = options.transform;
    self.map = options.map || {};
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
    else if (isObject(query))
      return self.get(
        keys(self.store).filter(function (id) {
          var entity = self.store[id];
          for (var key in query)
            if (query[key] !== entity[key])
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
      transform : options.transform || transform[name],
      map : options.map || map[name]
    });
    return collections[name];
  };

  Relate.collection.exists = function (name) {
    return name && name in collections;
  };

  Relate.import = function (data) {
    keys(data).forEach(function (collection) {
      Relate.collection.create(collection, {
        transform : transform[collection],
        map : map[collection]
      }).import(data[collection]);
    });
  };

  // Relate.Entity

  var Entity = Relate.Entity = {};

  Entity.prefix = undefined;

  Entity.get = function (collection, key) {
    var self = this,
        name = collection.key(key);

    if (name)
      return Relate.collection(name).get(self[key]);
    else
      return self[key];
  };

  Relate.mixin = function (entity, collection) {

    var destination = Entity.prefix ? entity[Entity.prefix] = {} : entity;

    ['get'].forEach(function (method) {
      destination[method] = Entity[method].bind(entity, collection);
    });
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
