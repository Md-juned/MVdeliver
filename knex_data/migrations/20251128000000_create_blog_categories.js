/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("blog_categories");

  if (!exists) {
    await knex.schema.createTable("blog_categories", function (table) {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.string("slug", 255).nullable().unique();
      table
        .enum("visibility_status", ["active", "inactive"])
        .notNullable()
        .defaultTo("active");

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("deleted_at").nullable();
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("blog_categories");
}

