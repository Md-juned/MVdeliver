/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("coupons");
  
  if (hasTable) {
    const hasColumn = await knex.schema.hasColumn("coupons", "discount_type");
    
    if (hasColumn) {
      // Change from ENUM to VARCHAR(20) - fixed string type
      await knex.raw(`
        ALTER TABLE coupons 
        MODIFY COLUMN discount_type VARCHAR(20) NOT NULL DEFAULT 'amount'
      `);
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasTable = await knex.schema.hasTable("coupons");
  
  if (hasTable) {
    const hasColumn = await knex.schema.hasColumn("coupons", "discount_type");
    
    if (hasColumn) {
      // Revert back to ENUM
      await knex.raw(`
        ALTER TABLE coupons 
        MODIFY COLUMN discount_type ENUM('amount', 'percentage') NOT NULL DEFAULT 'amount'
      `);
    }
  }
}

