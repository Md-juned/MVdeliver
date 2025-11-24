/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("device_tokens");

  if (!exists) {
    return knex.schema.createTable("device_tokens", function (table) {
      table.bigIncrements("id").primary();
      table.bigInteger("user_id").unsigned().notNullable();
      table.string("auth_token", 255).nullable();
      table.string("fcm_token", 255).nullable();
      table.string("device_token", 32).nullable();
      table.string("device_type", 32).nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("device_tokens");
}
