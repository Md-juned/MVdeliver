/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("offers");

  if (!exists) {
    await knex.schema.createTable("offers", function (table) {
      table.increments("id").primary();
      table.string("title", 255).notNullable();
      table.text("description").nullable();
      table.decimal("offer_percentage", 5, 2).notNullable();
      table.timestamp("end_time").notNullable();
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
  await knex.schema.dropTableIfExists("offers");
}

