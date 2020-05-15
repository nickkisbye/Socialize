const { Model } = require('objection');

const Role = require('./Role.js');
const Post = require('./Post.js');

class User extends Model {
    static tableName = 'users';

    static relationMappings = {
        role: {
          relation: Model.BelongsToOneRelation,
          modelClass: Role,
          join: {
            from: 'users.role_id',
            to: 'roles.id'
          }
        }
    };
}

module.exports = User;
