---
title: Serializers
---

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
