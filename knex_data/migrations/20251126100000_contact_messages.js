export async function up(knex) {
  const exists = await knex.schema.hasTable("contact_messages");
  if (exists) {
    return;
  }

  await knex.schema.createTable("contact_messages", function (table) {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.string("name", 255).notNullable();
    table.string("email", 255).notNullable();
    table.string("phone", 50).nullable();
    table.string("subject", 255).notNullable();
    table.text("message").notNullable();
    table
      .enum("status", ["pending", "resolved"])
      .notNullable()
      .defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("contact_messages");
}

