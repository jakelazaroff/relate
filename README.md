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

## Documentation

* [Getting Started](https://github.com/jakelazaroff/relate/blob/master/docs/getting-started.md)
* [API Documentation](https://github.com/jakelazaroff/relate/blob/master/docs/api-documentation.md)
