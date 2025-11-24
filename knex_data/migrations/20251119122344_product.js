/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('products', function (table) {
        table.increments("id").primary();

        table.integer("category_id").unsigned().notNullable();
        table.integer("restaurant_id").unsigned().notNullable();

        table.foreign("category_id").references("id").inTable("food_categories");
        table.foreign("restaurant_id").references("id").inTable("restaurants");

        table.string("image", 500).nullable();
        table.string("name", 255).notNullable();
        table.text("short_description").nullable();
        table.decimal("offer_price", 10, 2).nullable();   // *Offer Price*
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
    await knex.schema.dropTableIfExists("products");
}
