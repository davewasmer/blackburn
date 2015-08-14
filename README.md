# blackburn [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

Drop-in serializer support for Express/Connect Node apps..


## Install

```sh
$ npm install --save blackburn
```


## Usage

The simplest form of blackburn takes no options, and will use defaults as well as attempt to autodetect the right configuration settings.

```js
import blackburn from 'blackburn';
import express from 'express';

let app = express();
app.use(blackburn());

app.get('/', function(req, res, next) {
  res.render(Post.find(1));
});
```

`res.render()` accepts two arguments:

1. `payload` - the data you want to respond with. It can also be a promise which resolves with the intended payload.
2. `options` - allows you to pass options through to the renderer. For example, the JSON-API renderer accepts an `included` option to add sideloaded records to the response.

### Options

The blackburn middleware constructor takes several options, show below with their default values:

```js
blackburn({
  renderer: 'raw' // 'raw', 'root', 'jsonapi', or a custom Renderer instance
  adapter: // autodetect if not supplied. Can be any supported ORM name (i.e. 'mongoose') or a custom Adapter instance
  serializers: './serializers' // relative path to directory containing serializers, or an object whose keys are model types and values are the corresponding Serializer instances
  renderMethodKey: 'render' // the name of the method to attach to the response object. By default, will override the standard Express res.render
})
```


## Concepts

The goal of blackburn is to give your middleware code a consistent interface to render a JSON response with being concerned about the details of how that response is structured.

There are three main concepts you'll deal with:

* **Renderers** represent the different output structures and formats. For example, the JSONAPI renderer will send JSONAPI 1.0 compliant responses.
* **Adapters** allow blackburn to understand your ORM (or lack thereof). Because blackburn isn't tied to a specific ORM, it needs to know how to ask your models what type they are, what their relationships are, etc.
* **Serializers** tell blackburn what data should be sent in a response (i.e. whitelisting attributes to be included), as well as allow for basic renaming transformations (i.e. underscored_keys to camelCased).

For each of these concepts, you'll either choose a pre-built, bundled class (i.e. the `JSONAPIRenderer`, the `MongooseAdapter`), or supply your own custom instance that extends from the base class (i.e. `MyCustomORMAdapter`).


## Serializers

Serializers allow you to customize what data is returned the response, and apply simple transformations to it.

### Serializing attributes

By default, serializers must whitelist all attributes that will be sent back with the response:

```js
// serializers/user.js
import { Serializer } from 'blackburn';

export default Serializer.extend({
  attributes: [
    'first_name',
    'last_name',
    'email'
  ]
});
```

If your User model also includes an `hashed_password` field, then the serializer above would strip that from the response. One of the benefits here is that the UserSerializer will run whenever a user is serialized, _even if it's a related record_. This way, you don't need to remember to strip the `hashed_password` on every possible route in your app.

You can also customize how the data from your records is serialized, and apply basic transformations to it:

```js
// serializers/book.js
import { Serializer } from 'blackburn';

export default Serializer.extend({
  attributes: [
    'title',
    'published_at',
    'published_city'
  ],

  // keyForAttribute lets you rename attributes
  keyForAttribute(attributeName) {
    // In this case, we convert underscored_keys to camelCasedKeys
    return camelCase(attributeName);
  }
});
```

### Serializing relationships

You can also customize how related data is serialized with your records:

```js
// serializers/book.js
import { Serializer } from 'blackburn';

export default Serializer.extend({

  // ...

  relationships: {
    // Send only the ids for the related record(s)
    'author': 'ids',
    // Send the entire related records (when supplied / present)
    'author': 'records',
    // Don't send any part of the related records. For some renderers, this
    // means the relationship won't be present at all in the response. For
    // others, like the JSON-API renderer, it might still send the links for
    // this relationship.
    'author': false
  }

  // keyForRelationship lets you rename relationships
  keyForRelationship(relationshipName) {
    // In this case, we convert underscored_keys to camelCasedKeys
    return camelCase(relationshipName);
  }

});
```


## Adapter

Adapters let the renderer interrogate your payloads to understand what data was passed in. Adapters must implement a few required methods, and some optional ones to support more complex renderers like the JSON-API renderer.

The minimum interface that all adapters must implement:

```js
let CustomAdapter = blackburn.Adapter.extend({
  typeForRecord(record) {
    // return the type of the record, i.e. 'books'
  },
  idForRecord(record) {
    // return the type of the record, i.e. "507f1f77bcf86cd799439011"
  },
  attributesForRecord(record) {
    // return the attributes for the record, i.e.
    // {
    //   title: 'Human Action',
    //   published: 1949
    // }
  },
  relationshipsForRecord(record) {
    // return the relationships for the record as a object:
    // {
    //   'author': {          <-- name of the relationship
    //     type: 'person'       <-- model type
    //     kind: 'hasMany'      <-- or belongsTo for 1-1 relationships
    //     records: {} or []    <-- an object (for 1-1 relationships) or array
    //                              (1-n, n-n relationships) of the related
    //                              records (optional)
    //     ids:                 <-- the id or array of ids of the related
    //                              records (optional)
    //   }
    // }
  }
});
```

Other methods that may be required by more complex renderers:

```js
let CustomAdapter = blackburn.Adapter.extend({

  // ...

  linksForRecord(record) {
    // return the links for a record:
    // {
    //   'self': 'http://example.com/' + this.typeForRecord(record) + '/' + this.idForRecord(record)
    // }
  },

  metaForRecord(record) {
    // return the meta for the record, i.e. { copyright: 'Dave Wasmer 2015' }
  }

});
```


## Renderer

Renderers are fairly straightforward. They must implement a single method, `render()`, which takes two arguments:

```js
let CustomRenderer = blackburn.Renderer.extend({
  render(payload, options) {
    // payload and options come directly from the res.render(payload, options)
    // call in your own code. If payload was a promise when passed in, it will
    // be the resolved (or rejected) value of that promise by this point
  }
})
```

The built-in renderers (`raw`, `root`, and `jsonapi`) break up the single `render()` call into multiple smaller helper methods, making it easier to override and customize their implementation without re-implementing the entire class.




## License

MIT © [Dave Wasmer](http://davewasmer.com)


[npm-image]: https://badge.fury.io/js/blackburn.svg
[npm-url]: https://npmjs.org/package/blackburn
[travis-image]: https://travis-ci.org/davewasmer/blackburn.svg?branch=master
[travis-url]: https://travis-ci.org/davewasmer/blackburn
[daviddm-image]: https://david-dm.org/davewasmer/blackburn.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/davewasmer/blackburn
[coveralls-image]: https://coveralls.io/repos/davewasmer/blackburn/badge.svg
[coveralls-url]: https://coveralls.io/r/davewasmer/blackburn
