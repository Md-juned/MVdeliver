/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("cuisines");
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn("cuisines", "slug");
  if (hasColumn) return;

  await knex.schema.alterTable("cuisines", (table) => {
    table.string("slug", 255).nullable().unique();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasTable = await knex.schema.hasTable("cuisines");
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn("cuisines", "slug");
  if (!hasColumn) return;

  await knex.schema.alterTable("cuisines", (table) => {
    table.dropColumn("slug");
  });
}


