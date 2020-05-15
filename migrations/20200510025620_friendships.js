
exports.up = function(knex) {
    return knex.schema
    .createTable('friendships', table => {
        table.increments('id').notNullable();
        table.integer('user1_id').unsigned().notNullable();
        table.foreign('user1_id').references('users.id');
        table.integer('user2_id').unsigned().notNullable();
        table.foreign('user2_id').references('users.id');
        table.integer('is_accepted').unsigned().notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists('friendships')
};

