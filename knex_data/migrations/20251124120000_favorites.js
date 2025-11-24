/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("favorites", function (table) {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.integer("product_id").unsigned().notNullable();
    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.foreign("product_id").references("id").inTable("products").onDelete("CASCADE");
    table.unique(["user_id", "product_id"]);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("favorites");
}

