/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("addresses");
  if (!exists) {
    await knex.schema.createTable("addresses", function (table) {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable();
      table.string("name").notNullable();
      table.string("email").nullable();
      table.string("phone").nullable();
      table.string("address", 500).notNullable();
      table.decimal("latitude", 10, 7).nullable();
      table.decimal("longitude", 10, 7).nullable();
      table.string("delivery_type", 50).nullable().defaultTo("Home");
      table.boolean("is_default").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("deleted_at").nullable();
      table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("addresses");
}

