/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('food_categories', function (table) {
        table.increments("id").primary();
        table.string('image', 500).nullable();
        table.string('name', 255).notNullable();
        table.enu('status', ['active', 'inactive']).notNullable().defaultTo('active');
        table.timestamp('created_at').defaultTo(knex.fn.now()).nullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now()).nullable();
        table.timestamp('deleted_at').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists('food_categories');
};
