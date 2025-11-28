/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("settings");

  if (!exists) {
    await knex.schema.createTable("settings", (table) => {
      table.increments("id").primary();
      table.string("app_name", 255).notNullable().defaultTo("Foodigo");
      table.enu("preloader", ["enable", "disable"]).notNullable().defaultTo("disable");
      table.string("commission_type", 50).notNullable().defaultTo("commission");
      table.decimal("seller_commission_per_delivery", 5, 2).notNullable().defaultTo(2);
      table.decimal("delivery_commission_per_delivery", 5, 2).notNullable().defaultTo(2.5);
      table.string("contact_message_receiver_email", 255).notNullable().defaultTo("admin@gmail.com");
      table.string("timezone", 120).notNullable().defaultTo("Asia/Dhaka");
      table.decimal("per_kilometer_delivery_charge", 10, 2).notNullable().defaultTo(3);
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
  await knex.schema.dropTableIfExists("settings");
}


