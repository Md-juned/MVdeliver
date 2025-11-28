/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("blogs");

  if (!exists) {
    await knex.schema.createTable("blogs", function (table) {
      table.increments("id").primary();
      table.string("title", 500).notNullable();
      table.string("slug", 500).nullable().unique();
      table.integer("category_id").unsigned().notNullable();
      table.string("image", 500).nullable();
      table.text("description").nullable();
      table
        .enum("visibility_status", ["active", "inactive"])
        .notNullable()
        .defaultTo("active");
      table.text("tags").nullable().comment("JSON array or comma-separated tags");
      table.string("seo_title", 500).nullable();
      table.text("seo_description").nullable();

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("deleted_at").nullable();

      table
        .foreign("category_id")
        .references("id")
        .inTable("blog_categories")
        .onDelete("CASCADE");
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("blogs");
}

