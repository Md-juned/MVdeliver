/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    ALTER TABLE currencies
    MODIFY currency_position ENUM(
      'before',
      'after',
      'before_price',
      'before_price_with_space',
      'after_price',
      'after_price_with_space'
    ) NOT NULL DEFAULT 'before'
  `);

  await knex("currencies")
    .where("currency_position", "before")
    .update({ currency_position: "before_price" });

  await knex("currencies")
    .where("currency_position", "after")
    .update({ currency_position: "after_price" });

  await knex.raw(`
    ALTER TABLE currencies
    MODIFY currency_position ENUM(
      'before_price',
      'before_price_with_space',
      'after_price',
      'after_price_with_space'
    ) NOT NULL DEFAULT 'before_price'
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`
    ALTER TABLE currencies
    MODIFY currency_position ENUM(
      'before',
      'after',
      'before_price',
      'before_price_with_space',
      'after_price',
      'after_price_with_space'
    ) NOT NULL DEFAULT 'before'
  `);

  await knex("currencies")
    .where("currency_position", "like", "before_price%")
    .update({ currency_position: "before" });

  await knex("currencies")
    .where("currency_position", "like", "after_price%")
    .update({ currency_position: "after" });

  await knex.raw(`
    ALTER TABLE currencies
    MODIFY currency_position ENUM(
      'before',
      'after'
    ) NOT NULL DEFAULT 'before'
  `);
}


