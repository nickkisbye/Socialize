
exports.up = function(knex) {
    return knex.schema
    .createTable('posts', table => {
        table.increments('id').notNullable();
        table.string('text').notNullable();
        table.integer('author_id').unsigned().notNullable();
        table.foreign('author_id').references('users.id');
        table.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    });
};

exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists('posts')
};
