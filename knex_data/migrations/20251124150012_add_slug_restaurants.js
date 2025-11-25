/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("restaurants");
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn("restaurants", "slug");
  if (hasColumn) return;

  await knex.schema.alterTable("restaurants", (table) => {
    table.string("slug", 255).nullable().unique();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasTable = await knex.schema.hasTable("restaurants");
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn("restaurants", "slug");
  if (!hasColumn) return;

  await knex.schema.alterTable("restaurants", (table) => {
    table.dropColumn("slug");
  });
}


