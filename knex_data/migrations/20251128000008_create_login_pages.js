/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("login_pages");

  if (!exists) {
    await knex.schema.createTable("login_pages", function (table) {
      table.increments("id").primary();
      table.string("language", 10).notNullable().defaultTo("en");
      table.string("image_one", 500).nullable();
      table.string("title_one", 500).nullable();
      table.text("description_one").nullable();
      table.string("image_two", 500).nullable();
      table.string("title_two", 500).nullable();
      table.text("description_two").nullable();
      table.string("image_three", 500).nullable();
      table.string("title_three", 500).nullable();
      table.text("description_three").nullable();

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
  await knex.schema.dropTableIfExists("login_pages");
}

