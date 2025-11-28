/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("seller_withdraw_methods");

  if (!exists) {
    await knex.schema.createTable("seller_withdraw_methods", function (table) {
      table.increments("id").primary();
      table.string("name", 191).notNullable();
      table.decimal("minimum_amount", 10, 2).notNullable().defaultTo(0);
      table.decimal("maximum_amount", 10, 2).notNullable().defaultTo(0);
      table.decimal("withdraw_charge", 10, 2).notNullable().defaultTo(0);
      table.text("description").notNullable();
      table
        .enum("status", ["active", "inactive"])
        .notNullable()
        .defaultTo("inactive");

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
  await knex.schema.dropTableIfExists("seller_withdraw_methods");
}


