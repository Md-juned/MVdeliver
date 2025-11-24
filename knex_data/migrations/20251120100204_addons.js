/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('addons', function (table) {
        table.increments("id").primary();

        table.integer("restaurant_id").unsigned().notNullable();
        table.foreign("restaurant_id").references("id").inTable("restaurants");

        table.string("name", 255).notNullable();
        table.decimal("price", 10, 2).notNullable();

        table.enu("status", ["active", "inactive"]).defaultTo("active");

        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.timestamp("deleted_at").nullable();
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists("addons");
}
