/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("products");
  if (!hasTable) return;

  const hasIsFeatured = await knex.schema.hasColumn("products", "is_featured");
  const hasVisibility = await knex.schema.hasColumn("products", "visibility");

  await knex.schema.alterTable("products", (table) => {
    if (!hasIsFeatured) {
      table.boolean("is_featured").notNullable().defaultTo(false);
    }
    if (!hasVisibility) {
      table.enu("visibility", ["visible", "hidden"]).notNullable().defaultTo("visible");
    }
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasTable = await knex.schema.hasTable("products");
  if (!hasTable) return;

  await knex.schema.alterTable("products", (table) => {
    table.dropColumn("is_featured");
    table.dropColumn("visibility");
  });
}

