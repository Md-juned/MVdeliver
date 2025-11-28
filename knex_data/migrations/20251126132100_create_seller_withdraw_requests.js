/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("seller_withdraw_requests");

  if (!exists) {
    await knex.schema.createTable("seller_withdraw_requests", function (table) {
      table.increments("id").primary();
      table
        .integer("restaurant_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("restaurants")
        .onDelete("CASCADE");
      table
        .integer("withdraw_method_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("seller_withdraw_methods")
        .onDelete("RESTRICT");
      table.decimal("total_amount", 10, 2).notNullable().defaultTo(0);
      table.decimal("withdraw_amount", 10, 2).notNullable().defaultTo(0);
      table.decimal("withdraw_charge", 10, 2).notNullable().defaultTo(0);
      table.text("bank_account_info").notNullable();
      table.text("description").nullable();
      table
        .enum("status", ["pending", "approved", "rejected"])
        .notNullable()
        .defaultTo("pending");
      table.timestamp("processed_at").nullable();

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
  await knex.schema.dropTableIfExists("seller_withdraw_requests");
}


