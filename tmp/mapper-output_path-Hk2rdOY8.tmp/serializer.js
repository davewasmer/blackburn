{"blocks":[{"tags":{"title":{"type":"title","string":"Serializer","html":"<p>Serializer</p>"}},"description":{"full":"<p>Serializers allow you to customize what data is returned the response, and\napply simple transformations to it. They allow you to decouple what data is\nsent, with how that data is structured / rendered.</p>","summary":"<p>Serializers allow you to customize what data is returned the response, and\napply simple transformations to it. They allow you to decouple what data is\nsent, with how that data is structured / rendered.</p>","body":""},"isPrivate":false,"isConstructor":false,"isClass":false,"isEvent":false,"ignore":false,"line":6,"codeStart":14,"code":"export default CoreObject.extend({","ctx":false},{"tags":{"method":{"type":"method","string":"render","html":"<p>render</p>"},"abstract":{"type":"abstract","string":"","html":""},"param":[{"type":"param","string":"{Object[]|Error[]|Object|Error} payload","name":"payload","description":"","types":["Array.<Object>","Array.<Error>","Object","Error"],"typesDescription":"<code>Array</code>.&lt;<code>Object</code>&gt;|<code>Array</code>.&lt;<code>Error</code>&gt;|<code>Object</code>|<code>Error</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"html":"<p>{Object[]|Error[]|Object|Error} payload</p>"},{"type":"param","string":"{Object} options","name":"options","description":"","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"html":"<p>{Object} options</p>"},{"type":"param","string":"{Object} options.adapter  the adapter to use when interrogating\n                                  the payload models","name":"options.adapter","description":"<p>the adapter to use when interrogating                                   the payload models</p>","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"isNested":true}],"return":{"type":"return","string":"{Object}         the JSON response object","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"description":"<p>the JSON response object</p>"}},"description":{"full":"<p>Take the supplied payload of record(s) or error(s) and the supplied options\nand return a rendered a JSON response object.</p>","summary":"<p>Take the supplied payload of record(s) or error(s) and the supplied options\nand return a rendered a JSON response object.</p>","body":""},"isPrivate":false,"isConstructor":false,"isClass":false,"isEvent":false,"ignore":false,"line":16,"codeStart":30,"code":"render() {\n  throw new Error('You must implement the render method!');\n},","ctx":{"type":"method","name":"render","string":"render()"}},{"tags":{"type":{"type":"type","string":"{String[]}","types":["Array.<String>"],"typesDescription":"<code>Array</code>.&lt;<code>String</code>&gt;","optional":false,"nullable":false,"nonNullable":false,"variable":false,"html":"<p>{String[]}</p>"}},"description":{"full":"<p>The list of attribute names that should be serialized. Attributes not\nincluded in this list will be omitted from the final rendered payload.</p>","summary":"<p>The list of attribute names that should be serialized. Attributes not\nincluded in this list will be omitted from the final rendered payload.</p>","body":""},"isPrivate":false,"isConstructor":false,"isClass":false,"isEvent":false,"ignore":false,"line":34,"codeStart":40,"code":"attributes: [],","ctx":{"type":"property","name":"attributes","value":"[],","string":"attributes"}},{"tags":{"type":{"type":"type","string":"{Object}","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"html":"<p>{Object}</p>"}},"description":{"full":"<p>An object with configuration on how to serialize relationships.\nRelationships that have no configuration present are omitted from the final\nrendered payload.</p><p>Out of the box, two options are supported:</p><p><strong>strategy</strong></p><p>It has one of four possible values:</p><ul>\n<li><code>records</code>: embed all related records (1-n relationships)</li>\n<li><code>record</code>: embed the related record (1-1 relationships)</li>\n<li><code>ids</code>: include only the ids of related records (1-n relationships)</li>\n<li><code>id</code>: include only the id of the related record (1-1 relationships)</li>\n</ul>\n<p>What the embedded records or ids look like is up to each serializer to\ndetermine.</p><p><strong>type</strong></p><p>The model type of the related records.</p><p>Specific serializers may also accept additional options in the relationship\nconfiguration to customize their response format.</p>","summary":"<p>An object with configuration on how to serialize relationships.\nRelationships that have no configuration present are omitted from the final\nrendered payload.</p>","body":"<p>Out of the box, two options are supported:</p><p><strong>strategy</strong></p><p>It has one of four possible values:</p><ul>\n<li><code>records</code>: embed all related records (1-n relationships)</li>\n<li><code>record</code>: embed the related record (1-1 relationships)</li>\n<li><code>ids</code>: include only the ids of related records (1-n relationships)</li>\n<li><code>id</code>: include only the id of the related record (1-1 relationships)</li>\n</ul>\n<p>What the embedded records or ids look like is up to each serializer to\ndetermine.</p><p><strong>type</strong></p><p>The model type of the related records.</p><p>Specific serializers may also accept additional options in the relationship\nconfiguration to customize their response format.</p>"},"isPrivate":false,"isConstructor":false,"isClass":false,"isEvent":false,"ignore":false,"line":42,"codeStart":70,"code":"relationships: {},","ctx":{"type":"property","name":"relationships","value":"{},","string":"relationships"}},{"tags":{"method":{"type":"method","string":"serializeAttributes","html":"<p>serializeAttributes</p>"},"param":[{"type":"param","string":"{Object}            record  a model containing attributes to be\n                                    serialized","name":"record","description":"<p>a model containing attributes to be                                     serialized</p>","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false},{"type":"param","string":"{Object}            options","name":"options","description":"","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"html":"<p>{Object}            options</p>"}],"return":{"type":"return","string":"{Object}                    an object with serialized attributes\n                                    from the supplied record","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"description":"<p>an object with serialized attributes                                     from the supplied record</p>"}},"description":{"full":"<p>The base Serializer class comes with a few methods defined that take\nadvantage of some basic assumptions. <code>serializeAttributes</code> is one of them.\nYou don&#39;t actually have to use these methods at all, but most types of\nserializers will find them helpful.</p><p><code>serializeAttributes</code> takes a record, and return the attributes that should\nbe rendered. Note that attributes are distinct from relationships. This can\nserialization customized in several ways:</p><ul>\n<li>The attributes array on the serializer will act as a whitelist - only\nthose attributes will be serialzed.</li>\n<li>You can override the way keys and values are serialized by defining\nyour own .serializeAttributeName() and/or .serializeAttributeValue()\nmethods.</li>\n</ul>\n","summary":"<p>The base Serializer class comes with a few methods defined that take\nadvantage of some basic assumptions. <code>serializeAttributes</code> is one of them.\nYou don&#39;t actually have to use these methods at all, but most types of\nserializers will find them helpful.</p>","body":"<p><code>serializeAttributes</code> takes a record, and return the attributes that should\nbe rendered. Note that attributes are distinct from relationships. This can\nserialization customized in several ways:</p><ul>\n<li>The attributes array on the serializer will act as a whitelist - only\nthose attributes will be serialzed.</li>\n<li>You can override the way keys and values are serialized by defining\nyour own .serializeAttributeName() and/or .serializeAttributeValue()\nmethods.</li>\n</ul>\n"},"isPrivate":false,"isConstructor":false,"isClass":false,"isEvent":false,"ignore":false,"line":72,"codeStart":97,"code":"serializeAttributes(record, options) {\n  let serializedAttrs = {};\n  this.attributes.forEach((attributeName) => {\n    let key = this.serializeAttributeName(attributeName);\n    let rawValue = this.adapter.attributeFromRecord(record, attributeName, options);\n    if (!isUndefined(rawValue)) {\n      let value = this.serializeAttributeValue(rawValue, key, record);\n      serializedAttrs[key] = value;\n    }\n  });\n  return serializedAttrs;\n},","ctx":{"type":"method","name":"serializeAttributes","string":"serializeAttributes()"}},{"tags":{"method":{"type":"method","string":"serializeAttributeName","html":"<p>serializeAttributeName</p>"},"param":[{"type":"param","string":"{String}        attributeName","name":"attributeName","description":"","types":["String"],"typesDescription":"<code>String</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"html":"<p>{String}        attributeName</p>"}],"return":{"type":"return","string":"{String}                      the key that should be used for this\n                                      attribute name","types":["String"],"typesDescription":"<code>String</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"description":"<p>the key that should be used for this                                       attribute name</p>"}},"description":{"full":"<p>Take an attribute name and return the serialized key name. Useful for\ntransforming or renaming attributes in the rendered payload, i.e.\ntransforming snake_case to camelCase keys, or vice versa.</p><p>The default implementation returns the attribute name unchanged.</p>","summary":"<p>Take an attribute name and return the serialized key name. Useful for\ntransforming or renaming attributes in the rendered payload, i.e.\ntransforming snake_case to camelCase keys, or vice versa.</p>","body":"<p>The default implementation returns the attribute name unchanged.</p>"},"isPrivate":false,"isConstructor":false,"isClass":false,"isEvent":false,"ignore":false,"line":110,"codeStart":124,"code":"serializeAttributeName(attributeName) {\n  return attributeName;\n},","ctx":{"type":"method","name":"serializeAttributeName","string":"serializeAttributeName()"}},{"tags":{"method":{"type":"method","string":"serializeAttributeValue","html":"<p>serializeAttributeValue</p>"},"param":[{"type":"param","string":"{*}            value","name":"value","description":"","types":[],"typesDescription":"<code>*</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"html":"<p>{*}            value</p>"},{"type":"param","string":"{String}       key","name":"key","description":"","types":["String"],"typesDescription":"<code>String</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"html":"<p>{String}       key</p>"},{"type":"param","string":"{Object}       record","name":"record","description":"","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"html":"<p>{Object}       record</p>"}],"return":{"type":"return","string":"{*}             the value that should be rendered","types":[],"typesDescription":"<code>*</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"description":"<p>the value that should be rendered</p>"}},"description":{"full":"<p>Take an attribute value and return the serialized value. Useful for\nchanging how certain types of values are serialized, i.e. Date objects.</p><p>The default implementation returns the attribute&#39;s value unchanged.</p>","summary":"<p>Take an attribute value and return the serialized value. Useful for\nchanging how certain types of values are serialized, i.e. Date objects.</p>","body":"<p>The default implementation returns the attribute&#39;s value unchanged.</p>"},"isPrivate":false,"isConstructor":false,"isClass":false,"isEvent":false,"ignore":false,"line":128,"codeStart":142,"code":"serializeAttributeValue(value","ctx":{"type":"method","name":"serializeAttributeValue","string":"serializeAttributeValue()"}},{"tags":{},"description":{"full":"<p>, key, record</p>","summary":"<p>, key, record</p>","body":""},"isPrivate":false,"isConstructor":false,"isClass":false,"isEvent":false,"ignore":false,"line":142,"codeStart":143,"code":"{\n   return value;\n },","ctx":false},{"tags":{"method":{"type":"method","string":"serializeRelationships","html":"<p>serializeRelationships</p>"},"param":[{"type":"param","string":"{Object}               record  the record to extract relationships\n                                       from","name":"record","description":"<p>the record to extract relationships                                        from</p>","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false},{"type":"param","string":"{Object}               options","name":"options","description":"","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"html":"<p>{Object}               options</p>"}],"return":{"type":"return","string":"{Object}                              the serialized relationships","types":["Object"],"typesDescription":"<code>Object</code>","optional":false,"nullable":false,"nonNullable":false,"variable":false,"description":"<p>the serialized relationships</p>"}},"description":{"full":"<p>The base Serializer class comes with a few methods defined that take\nadvantage of some basic assumptions. <code>serializeRelationships</code> is one of\nthem. You don&#39;t actually have to use these methods at all, but most types\nof serializers will find them helpful.</p><p><code>serializeRelationships</code> takes a record and returns an object whose keys\nare the relationship names, and values are relationship descriptors\ncontaining the following information about the relationship:</p><ul>\n<li><code>config</code> - the config supplied in the relationships object (see\n{@link Serializer#relationships})</li>\n<li><code>data</code> - contains any data that the adapter was able to return.</li>\n</ul>\n<p>It only returns relationships that have relationship config present,\nsimilar to how <code>serializeAttributes()</code> only returns attributes present in\nthe <code>Serializer.attributes</code> whitelist.</p><p>You can tweak this serialization process by overriding either\n<code>.serializeRelationshipName()</code> or <code>.serializeRelationshipValue()</code>.</p>","summary":"<p>The base Serializer class comes with a few methods defined that take\nadvantage of some basic assumptions. <code>serializeRelationships</code> is one of\nthem. You don&#39;t actually have to use these methods at all, but most types\nof serializers will find them helpful.</p>","body":"<p><code>serializeRelationships</code> takes a record and returns an object whose keys\nare the relationship names, and values are relationship descriptors\ncontaining the following information about the relationship:</p><ul>\n<li><code>config</code> - the config supplied in the relationships object (see\n{@link Serializer#relationships})</li>\n<li><code>data</code> - contains any data that the adapter was able to return.</li>\n</ul>\n<p>It only returns relationships that have relationship config present,\nsimilar to how <code>serializeAttributes()</code> only returns attributes present in\nthe <code>Serializer.attributes</code> whitelist.</p><p>You can tweak this serialization process by overriding either\n<code>.serializeRelationshipName()</code> or <code>.serializeRelationshipValue()</code>.</p>"},"isPrivate":false,"isConstructor":false,"isClass":false,"isEvent":false,"ignore":false,"line":146,"codeStart":175,"code":"serializeRelationships(record, options) {\n  let serializedRelationships = {};\n  forOwn(this.relationships, (relationshipConfig, relationshipName) => {\n    let key = this.serializeRelationshipName(relationshipName);\n    let adapterData = this.adapter.relationshipFromRecord(record, relationshipName, relationshipConfig, options);\n    assert(adapterData, `Your serializer supplied config for a \"${ relationshipName }\" relationship, but your adapter didn't return any information about it.`);\n    let data = this.serializeRelationshipValue(adapterData, relationshipName, record, relationshipConfig, options);\n    serializedRelationships[key] = {\n      config: relationshipConfig,\n      data: data\n    };\n  });\n  return serializedRelationships;\n},\n\n/**\n * Take a relationship name and return the serialized key for that name.\n *\n * @method serializeRelationshipName\n *\n * @param  {String}                  relationshipName\n *\n * @return {String}\n */\nserializeRelationshipName(relationshipName) {\n  return relationshipName;\n},\n\n/**\n * Take a relationship payload from the adapter and serialize it.\n *\n * @method serializeRelationship\n *\n * @param  {Object[]|Object|String|Number}  data  the ids, id, records, or\n * record supplied by the adapter\n * @param  {String}  key  the serialized name of the relationship\n * @param  {Object}  record  the parent record containing the relationship\n * @param  {Object}  config  the user supplied relationship config specified\n * on the serializer\n * @param  {Object}  options\n *\n * @return {*}\n */\nserializeRelationshipValue(data) {\n  return data;\n},\n\n/**\n * Given a record, return the matching serializer for that record's type.\n *\n * @method serializerFor\n *\n * @param  {Object}      record\n *\n * @return {Object}             the appropriate serializer\n */\nserializerFor(record, options) {\n  let type = this.adapter.typeForRecord(record, options);\n  let serializer = this.serializers[type] || this.serializers.application;\n  assert(serializer, `Could not find a serializer for ${ type } type records.`);\n  return serializer;\n}\n\n});","ctx":{"type":"method","name":"serializeRelationships","string":"serializeRelationships()"}}],"url":"lib/serializer.js","path":"lib/serializer.js","name":"Serializer"}