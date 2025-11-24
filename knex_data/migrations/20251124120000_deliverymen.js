/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("deliverymen", function (table) {
    table.increments("id").primary();
    table.string("first_name", 255).notNullable();
    table.string("email", 255).notNullable();
    table.string("password", 255).notNullable();
    table.string("phone_number", 20).notNullable();
    table.string("image", 500).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.timestamp("deleted_at").nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("deliverymen");
}

