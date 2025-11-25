/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasSocialId = await knex.schema.hasColumn("users", "social_id");
  if (!hasSocialId) {
    await knex.schema.table("users", function (table) {
      table.string("social_id", 255).nullable();
      table.string("social_type", 50).nullable().comment("google, facebook");
      table.string("image", 500).nullable();
      table.unique(["social_id", "social_type"]);
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table("users", function (table) {
    table.dropUnique(["social_id", "social_type"]);
    table.dropColumn("social_id");
    table.dropColumn("social_type");
    table.dropColumn("image");
  });
}

