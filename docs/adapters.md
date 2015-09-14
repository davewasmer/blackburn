---
title: Adapters
---

## Adapters

Adapters let the blackburn talk to your models, regardless of what ORM you are using. If blackburn doesn't have a built-in adapter for your ORM yet, fear not - they are relatively simple to create. Just implement the following 4 methods:

```js
let CustomAdapter = blackburn.Adapter.extend({
  typeForRecord(record, options) {
    // return the type of the record, i.e. 'books'
  },
  idForRecord(record, options) {
    // return the type of the record, i.e. "507f1f77bcf86cd799439011"
  },
  attributeFromRecord(record, attributeName, options) {
    // return the attribute requested from the record, i.e.:
    // attributesFromRecord({ title: 'foo' }, 'title', options) => 'foo'
  },
  relationshipFromRecord(record, name, config, options) {
    // return whatever data is specified in the config for the relationship;
    // i.e.
    //
    // relationshipFromRecord({ author_id: 1 }, 'author', { strategy: 'id' }, options) => 1
  }
});
```

That's it! Notice that each method accepts a final argument that is an `options` hash. This is the options hash you pass into `res.render(payload, options)` from your route handler, so if you need to customize functionality beyond what blackburn allows, that's an easy "escape valve" to handle that.
