/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("about_us_pages");

  if (!exists) {
    await knex.schema.createTable("about_us_pages", function (table) {
      table.increments("id").primary();
      table.string("language", 10).notNullable().defaultTo("en");
      table.string("about_image", 500).nullable();
      table.string("title", 500).nullable();
      table.text("description").nullable();
      table.integer("experience_year").nullable();
      table.text("additional_data").nullable().comment("JSON string for additional fields");

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
  await knex.schema.dropTableIfExists("about_us_pages");
}

