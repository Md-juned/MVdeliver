/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("offer_deal_banners");

  if (!exists) {
    await knex.schema.createTable("offer_deal_banners", function (table) {
      table.increments("id").primary();
      table.string("image", 500).notNullable();
      table.string("url", 500).notNullable();
      table
        .enum("status", ["active", "inactive"])
        .notNullable()
        .defaultTo("inactive");
      table.integer("display_order").unsigned().defaultTo(0);

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
  await knex.schema.dropTableIfExists("offer_deal_banners");
}


