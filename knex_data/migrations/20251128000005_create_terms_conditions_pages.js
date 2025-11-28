/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("terms_conditions_pages");

  if (!exists) {
    await knex.schema.createTable("terms_conditions_pages", function (table) {
      table.increments("id").primary();
      table.string("language", 10).notNullable().defaultTo("en");
      table.string("title", 500).nullable();
      table.text("description").nullable();

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("deleted_at").nullable();

      table.unique(["language"], "unique_language");
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("terms_conditions_pages");
}

