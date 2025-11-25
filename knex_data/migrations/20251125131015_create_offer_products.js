/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("offer_products");

  if (!exists) {
    await knex.schema.createTable("offer_products", function (table) {
      table.increments("id").primary();
      table.integer("offer_id").unsigned().notNullable();
      table.integer("product_id").unsigned().notNullable();
      
      // Foreign keys
      table.foreign("offer_id").references("id").inTable("offers").onDelete("CASCADE");
      table.foreign("product_id").references("id").inTable("products").onDelete("CASCADE");
      
      // Unique constraint: one product can only be in one offer at a time
      table.unique(["offer_id", "product_id"]);
      
      // Timestamps
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("deleted_at").nullable();
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("offer_products");
}

