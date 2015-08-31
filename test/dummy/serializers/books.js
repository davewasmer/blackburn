import Serializer from '../../../lib/serializer';

export default Serializer.extend({

  attributes: [ 'title' ],

  relationships: {
    author: {
      type: 'user',
      strategy: 'include'
    },
    category: {
      strategy: 'id',
      relatedLink: '',
      relationshipLink: ''
    }
  }

});
