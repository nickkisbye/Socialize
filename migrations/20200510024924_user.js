
exports.up = function (knex) {
    return knex.schema
        .createTable('roles', table => {
            table.increments('id').notNullable();
            table.string('role').unique().notNullable;
        })
        .createTable('users', table => {
            table.increments('id').notNullable();
            table.string('username').unique().notNullable();
            table.string('email').unique().notNullable();
            table.string('password').notNullable();
            table.string('first_name');
            table.string('last_name');
            table.string('city');
            table.string('postal_code');
            table.integer('age');
            table.string('profile_text');
            table.string('profile_image');

            table.integer('role_id').unsigned().notNullable();
            table.foreign('role_id').references('roles.id');

            table.dateTime('updated_at').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'));
            table.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('users')
        .dropTableIfExists('roles')
};
