/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("payment_gateways");

  if (!exists) {
    await knex.schema.createTable("payment_gateways", (table) => {
      table.increments("id").primary();
      table.string("gateway", 50).notNullable().unique();
      table.enu("status", ["active", "inactive"]).notNullable().defaultTo("inactive");
      table.string("image", 500).nullable();
      table.string("currency", 10).notNullable().defaultTo("USD");
      table.string("public_key", 255).notNullable().defaultTo("");
      table.string("secret_key", 255).notNullable().defaultTo("");
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
  await knex.schema.dropTableIfExists("payment_gateways");
}


