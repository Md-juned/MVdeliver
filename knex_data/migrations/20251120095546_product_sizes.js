/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('product_sizes', function (table) {
        table.increments("id").primary();

        table.integer("product_id").unsigned().notNullable();
        table.foreign("product_id").references("id").inTable("products");

        table.string("size_name", 100).notNullable();
        table.decimal("price", 10, 2).notNullable();

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
    await knex.schema.dropTableIfExists("product_sizes");
}
