/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("restaurants");

  if (!exists) {
    await knex.schema.createTable("restaurants", function (table) {
    table.increments("id").primary();

    // Basic Info
    table.string("name", 255).notNullable();
    table.string("logo_image", 500).nullable();
    table.string("cover_image", 500).nullable();

    // City / Cuisine
    table.integer("city_id").unsigned().nullable();
    table.integer("cuisine_id").unsigned().nullable();

    // Contact + Address + Map
    table.string("whatsapp_phone", 20).nullable();
    table.string("address", 500).nullable();
    table.decimal("latitude", 10, 7).nullable();
    table.decimal("longitude", 10, 7).nullable();
    table.integer("max_delivery_distance").nullable();

    // Restaurant Owner Info
    table.string("owner_name", 255).nullable();
    table.string("owner_email", 255).nullable();
    table.string("owner_phone", 20).nullable();

    // Account Information  
    table.string("account_name", 255).nullable();
    table.string("account_email", 255).nullable();
    table.string("account_password", 255).nullable();

    // Other Info  
    table.string("opening_time", 50).nullable();
    table.string("closing_time", 50).nullable();
    table.string("min_food_processing_time", 50).nullable();
    table.string("max_food_processing_time", 50).nullable();
    table.string("time_slot_seprated", 50).nullable();
    table.string("tags", 500).nullable();

    table.boolean("is_featured").defaultTo(false);
    table.boolean("pickup_order").defaultTo(false);
    table.boolean("delivery_order").defaultTo(true);

    // Approval + Trusted
    table.enu("approval_status", ["pending", "approved", "rejected"]).defaultTo("pending");
    table.boolean("is_trusted").defaultTo(false);

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
  await knex.schema.dropTableIfExists("restaurants");
}
