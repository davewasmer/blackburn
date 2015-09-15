---
layout: homepage
---

## Concepts

The goal of Blackburn is to give your application code a consistent interface to render a JSON response without being concerned about the details of how that response is structured. This lets you separate the presentation of your responses from the work of building them.

There are two main concepts you'll deal with:

* **Adapters** allow blackburn to understand your ORM (or lack thereof - see the RawAdapter). Because blackburn isn't tied to a specific ORM, it needs to know how to ask your models what type they are, what their relationships are, etc. Adapters provide this ability.

* **Serializers** represent the different output structures and formats. For example, the JSONAPI serializer will send JSONAPI 1.0 compliant responses. Serializers can also let you customize the response, i.e. whitelisting attributes to be included or renaming underscored_keys to camelCased).

For adapters, you'll typically either choose a pre-built, bundled class (i.e. the `MongooseAdapter` if you are using Mongoose), or supply your own if your ORM isn't supported out of the box (don't worry, they are easy to implement!).

For serializers, you'll typically choose a base serializer class based on the format you want for your API (i.e. flat objects, JSONAPI 1.0, etc). Each model should extend from that base serializer and customize which of its attributes and relationships are sent over the wire (i.e. BooksSerializer extends JSONAPISerializer).


## Usage

Blackburn hooks into your app as an middleware. To use it, you need to supply two things: an adapter, and serializers. Here's a simple example:

```js
// app.js
import blackburn from 'blackburn';
import express from 'express';

let app = express();
app.use(blackburn({
  // Tell blackburn to use the RawAdapter to inspect payloads
  adapter: new blackburn.RawAdapter()
}));

app.get('/', function(req, res, next) {
  // res.render() accepts a Promise, and will render the resolved
  // value (or the rejection Error).
  res.render(Post.find(1));
});

// serializers/books.js
import FlatSerializer from 'blackburn';

// The FlatSerializer will render Book models as flat JSON
// objects or arrays
export default FlatSerializer.extend({
  attributes: [ 'title', 'description' ]
});
```

In this example, blackburn will use the `RawAdapter` to interrogate models that you pass into `res.render()`, and it will render the models using the `FlatSerializer`.

Blackburn overrides `res.render()` by default (although this is customizable). It accepts two arguments:

1. `payload` - the data you want to send in the response. It can also be a promise which resolves with the intended payload.
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
