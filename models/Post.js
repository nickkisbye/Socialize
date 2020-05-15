const { Model } = require('objection');
const { userSearchCredentials } = require('../configs/dbSelection');

class Post extends Model {
  static tableName = 'posts';

  static get relationMappings() {
    const User = require('./User.js');
    return {
      users: {
        relation: Model.HasOneRelation,
        modelClass: User,
        filter: query => query.select(userSearchCredentials),
        join: {
          from: 'posts.author_id',
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = Post;