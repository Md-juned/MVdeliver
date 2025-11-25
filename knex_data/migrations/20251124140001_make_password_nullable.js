/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Make password nullable for social login users
  await knex.schema.alterTable("users", function (table) {
    table.string("password").nullable().alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("users", function (table) {
    table.string("password").notNullable().alter();
  });
}

