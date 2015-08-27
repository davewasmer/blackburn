import Serializer from '../../../lib/serializer';

export default Serializer.extend({

  attributes: [ 'title' ],

  relationships: {
    author: {
      strategy: 'include'
    },
    category: {
      strategy: 'id',
      relatedLink: '',
      relationshipLink: ''
    }
  }

});
