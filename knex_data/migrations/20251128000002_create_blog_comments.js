/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("blog_comments");

  if (!exists) {
    await knex.schema.createTable("blog_comments", function (table) {
      table.increments("id").primary();
      table.integer("blog_id").unsigned().notNullable();
      table.string("name", 255).notNullable();
      table.string("email", 255).notNullable();
      table.text("comment").notNullable();
      table
        .enum("status", ["active", "inactive"])
        .notNullable()
        .defaultTo("active");

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("deleted_at").nullable();

      table
        .foreign("blog_id")
        .references("id")
        .inTable("blogs")
        .onDelete("CASCADE");
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("blog_comments");
}

