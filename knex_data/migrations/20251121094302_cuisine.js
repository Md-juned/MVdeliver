/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("cuisines");

  if (!exists) {
    return knex.schema.createTable("cuisines", function (table) {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.string("image", 500).nullable();
      table.string("status", 50).defaultTo("active");
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
  await knex.schema.dropTableIfExists("cuisines");
}
