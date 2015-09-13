# blackburn [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

Drop-in, ORM agnostic serializer support for Express/Connect Node apps.


## Install

```sh
$ npm install --save blackburn
```


## Usage

Blackburn hooks into your app as an Express/Connect middleware. To use it, you
need to supply two things: an adapter, and serializers. Here's a simple example:

```js
// app.js
import blackburn from 'blackburn';
import express from 'express';

let app = express();
app.use(blackburn({
  adapter: new blackburn.RawAdapter()
}));

app.get('/', function(req, res, next) {
  res.render(Post.find(1));
});

// serializers/books.js
import FlatSerializer from 'blackburn';

export default FlatSerializer.extend({
  attributes: [ 'title', 'description' ]
});
```

This sets up blackburn to use the `raw` adapter and supplies it with a `books` serializer (more on adapters and serializers below).

Blackburn overrides `res.render()` by default (although this is customizable). It accepts two arguments:

1. `payload` - the data you want to respond with. It can also be a promise which resolves with the intended payload.
2. `options` - allows you to pass options through to the renderer. For example, the JSON-API renderer accepts an `included` option to add sideloaded records to the response.

You can customize the name of blackburn's render method by passing in the "renderMethodName" option:

```js
app.use(blackburn({
  // ...
  renderMethodName: "renderJSON"
}));

app.get('/', function(req, res, next) {
  res.renderJSON(/*...*/);
});
```

### Options

The blackburn middleware constructor takes several options, show below with their default values:

```js
blackburn({
  adapter: // Required. Must be an instance of blackburn.Adapter. Specific to your ORM (i.e. the MongooseAdapter).
  serializers: './serializers' // relative path to directory containing serializers, or an object whose keys are model types and values are the corresponding Serializer instances, i.e. { "books": BookSerializer }
  renderMethodKey: 'render' // the name of the method to attach to the response object. By default, will override the standard Express res.render
})
```

## Concepts

The goal of blackburn is to give your middleware code a consistent interface to render a JSON response without being concerned about the details of how that response is structured. This lets you separate the presentation of your responses from the work of building them.

There are two main concepts you'll deal with:

* **Adapters** allow blackburn to understand your ORM (or lack thereof - see the RawAdapter). Because blackburn isn't tied to a specific ORM, it needs to know how to ask your models what type they are, what their relationships are, etc.
* **Serializers** represent the different output structures and formats. For example, the JSONAPI serializer will send JSONAPI 1.0 compliant responses. Serializers can also let you customize the response, i.e. whitelisting attributes to be included or renaming underscored_keys to camelCased).

For adapters, you'll typically either choose a pre-built, bundled class (i.e. the `MongooseAdapter` if you are using Mongoose), or supply your own if your ORM isn't supported out of the box.

For serializers, you'll typically choose a format for your API (i.e. flat JSON, JSONAPI 1.0, etc) and choose a base serializer for that format (i.e. the `JSONAPISerializer`). Then each model type will extend from that base serializer and customize which of its attributes and relationships are sent over the wire (i.e. BooksSerializer extends JSONAPISerializer).

## Serializers

Serializers allow you to customize what data is returned the response, and apply simple transformations to it.

### Serializing attributes

By default, you must define a whitelist of all attributes that will be sent back with the response:

```js
// serializers/user.js
import { FlatSerializer } from 'blackburn';

export default FlatSerializer.extend({
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

  // keyForAttribute lets you rename attribute names when they are converted to payload keys
  keyForAttribute(attributeName) {
    // In this case, we convert underscored_keys to camelCasedKeys
    return camelCase(attributeName);
  }
});
```

### Serializing relationships

You can also customize how related data is serialized with your records. Serializing relationships is typically much more complex than basic attributes, so you can provide your own config for each relationship to decide how it is serialized.

Only three options are supported by all the built-in serializers: `type` (required), `strategy` (required), and `serializer` (optional):

```js
// serializers/book.js
import { FlatSerializer } from 'blackburn';

export default FlatSerializer.extend({

  relationships: {
    author: {
      // The type of the related record
      type: 'users',
      // Send only the id of the author, not the entire author record. Other
      // possible strategies include 'ids', 'record', and 'records'. The last
      // two send the entire related record(s) with the response.
      strategy: 'id',
      // If you want to customize how a related record is serialized, different
      // from it's standard serializer, you can supply a serializer for only
      // this relationship
      serializer: BookAuthorSerializer
    }
  }
});
```

Similar to attributes, you can also perform basic transformations to the relationship and it's properties:

```js
// serializers/book.js
import { FlatSerializer } from 'blackburn';

export default FlatSerializer.extend({

  // keyForRelationship lets you rename relationships
  keyForRelationship(relationshipName) {
    // In this case, we convert underscored_keys to camelCasedKeys
    return camelCase(relationshipName);
  }

});
```

Finally, some serializers may provide more options for serializing relationships. For example, the JSONAPI serializer supports adding relationship links to the payload:

```js
// serializers/book.js
import { JSONAPISerializer } from 'blackburn';

export default JSONAPISerializer.extend({

  relationships: {
    author: {
      type: 'users',
      strategy: 'id',
      relationshipLink: '/books/{id}/relationships/author',
      relatedLink: '/books/{id}/author'
    }
  }
});
```

See the documentation for each serializer for available options.

## Adapter

Adapters let the blackburn "speak the same language" as your models, regardless of what ORM you are using. If blackburn doesn't have a built-in adapter for your ORM yet, fear not - they are relatively simple to implement: just 4 methods.

The interface that an adapter must implement:

```js
let CustomAdapter = blackburn.Adapter.extend({
  typeForRecord(record, options) {
    // return the type of the record, i.e. 'books'
  },
  idForRecord(record, options) {
    // return the type of the record, i.e. "507f1f77bcf86cd799439011"
  },
  attributesFromRecord(record, attributeName, options) {
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
