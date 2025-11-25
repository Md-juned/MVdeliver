/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("food_categories");
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn("food_categories", "slug");
  if (hasColumn) return;

  await knex.schema.alterTable("food_categories", (table) => {
    table.string("slug", 255).nullable().unique();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasTable = await knex.schema.hasTable("food_categories");
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn("food_categories", "slug");
  if (!hasColumn) return;

  await knex.schema.alterTable("food_categories", (table) => {
    table.dropColumn("slug");
  });
}


