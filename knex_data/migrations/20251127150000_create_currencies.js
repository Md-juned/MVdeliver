/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("currencies");

  if (!exists) {
    await knex.schema.createTable("currencies", (table) => {
      table.increments("id").primary();
      table.string("name", 120).notNullable();
      table.string("code", 10).notNullable().unique();
      table.string("country_code", 10).nullable();
      table.string("icon", 500).nullable();
      table.decimal("rate", 10, 4).notNullable().defaultTo(1);
      table
        .enu("currency_position", ["before", "after"])
        .notNullable()
        .defaultTo("before");
      table.boolean("is_default").notNullable().defaultTo(false);
      table.enu("status", ["active", "inactive"]).notNullable().defaultTo("active");
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
  await knex.schema.dropTableIfExists("currencies");
}

