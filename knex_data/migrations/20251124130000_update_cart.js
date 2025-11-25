/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Add size_id to cart table
  const hasSizeId = await knex.schema.hasColumn("cart", "size_id");
  if (!hasSizeId) {
    await knex.schema.table("cart", function (table) {
      table.integer("size_id").unsigned().nullable();
      table.foreign("size_id").references("id").inTable("product_sizes").onDelete("SET NULL");
    });
  }

  // Create cart_addons table
  const exists = await knex.schema.hasTable("cart_addons");
  if (!exists) {
    await knex.schema.createTable("cart_addons", function (table) {
      table.increments("id").primary();
      table.integer("cart_id").unsigned().notNullable();
      table.integer("addon_id").unsigned().notNullable();
      table.integer("quantity").unsigned().defaultTo(1);
      table.foreign("cart_id").references("id").inTable("cart").onDelete("CASCADE");
      table.foreign("addon_id").references("id").inTable("addons").onDelete("CASCADE");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("cart_addons");
  await knex.schema.table("cart", function (table) {
    table.dropForeign("size_id");
    table.dropColumn("size_id");
  });
}

