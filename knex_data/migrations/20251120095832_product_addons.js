/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('product_addons', function (table) {
        table.increments("id").primary();

        table.integer("product_id").unsigned().notNullable();
        table.foreign("product_id").references("id").inTable("products");

        table.integer("addon_id").unsigned().notNullable();  // dropdown selected ID
        table.foreign("addon_id").references("id").inTable("addons");

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
    await knex.schema.dropTableIfExists("product_addons");
}
