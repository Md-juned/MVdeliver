/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("coupons");

  if (!exists) {
    await knex.schema.createTable("coupons", function (table) {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.string("code", 100).notNullable().unique();
      table.date("expired_date").notNullable();
      table.decimal("min_purchase_price", 10, 2).notNullable().defaultTo(0);
      table.enum("discount_type", ["amount", "percentage"]).notNullable().defaultTo("amount");
      table.decimal("discount", 10, 2).notNullable();
      table.enum("status", ["active", "inactive"]).notNullable().defaultTo("active");
      
      // Timestamps
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
  await knex.schema.dropTableIfExists("coupons");
}

