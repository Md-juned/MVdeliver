/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("promotional_banners");

  if (!exists) {
    await knex.schema.createTable("promotional_banners", function (table) {
      table.increments("id").primary();
      table.string("section_key", 100).notNullable().unique();
      table.string("title", 255).notNullable();
      table.string("image", 500).nullable();
      table.string("url", 500).nullable();
      table
        .enum("status", ["active", "inactive"])
        .notNullable()
        .defaultTo("inactive");
      table.integer("display_order").unsigned().defaultTo(0);

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("deleted_at").nullable();
    });

    const now = new Date();
    await knex("promotional_banners").insert([
      {
        section_key: "home_banner_one",
        title: "Home Promotional Banner One",
        created_at: now,
        updated_at: now,
      },
      {
        section_key: "home_banner_two",
        title: "Home Promotional Banner Two",
        created_at: now,
        updated_at: now,
      },
      {
        section_key: "search_restaurant_banner",
        title: "Search Page Restaurant Banner",
        created_at: now,
        updated_at: now,
      },
      {
        section_key: "blog_banner_one",
        title: "Blog Page Banner One",
        created_at: now,
        updated_at: now,
      },
      {
        section_key: "blog_banner_two",
        title: "Blog Page Banner Two",
        created_at: now,
        updated_at: now,
      },
    ]);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("promotional_banners");
}


