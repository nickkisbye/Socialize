
exports.up = function(knex) {
    return knex.schema
    .createTable('private_messages', table => {
        table.increments('id').notNullable();
        table.string('body').notNullable();
        table.integer('user1_id').unsigned().notNullable();
        table.foreign('user1_id').references('users.id');
        table.integer('user2_id').unsigned().notNullable();
        table.foreign('user2_id').references('users.id');
    });
};

exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists('private_messages')
};

