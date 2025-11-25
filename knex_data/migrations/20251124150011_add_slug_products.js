/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("products");
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn("products", "slug");
  if (hasColumn) return;

  await knex.schema.alterTable("products", (table) => {
    table.string("slug", 255).nullable().unique();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasTable = await knex.schema.hasTable("products");
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn("products", "slug");
  if (!hasColumn) return;

  await knex.schema.alterTable("products", (table) => {
    table.dropColumn("slug");
  });
}


