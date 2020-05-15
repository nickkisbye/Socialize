const { Model } = require('objection');
const { userSearchCredentials } = require('../configs/dbSelection');

const User = require('./User.js');

class Friendship extends Model {
    static tableName = 'friendships';

    static relationMappings = {
        user1: {
          relation: Model.HasManyRelation,
          modelClass: User,
          filter: query => query.select(userSearchCredentials),
          join: {
            from: 'friendships.user1_id',
            to: 'users.id'
          }
        },
        user2: {
          relation: Model.HasManyRelation,
          modelClass: User,
          join: {
            from: 'friendships.user2_id',
            to: 'users.id'
          }
        }
    };
}

module.exports = Friendship;