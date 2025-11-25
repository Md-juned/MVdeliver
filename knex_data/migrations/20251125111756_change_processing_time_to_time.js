/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("restaurants");
  
  if (hasTable) {
    // Check if columns exist before altering
    const hasMinTime = await knex.schema.hasColumn("restaurants", "min_food_processing_time");
    const hasMaxTime = await knex.schema.hasColumn("restaurants", "max_food_processing_time");
    
    // First, convert existing string values to proper TIME format
    // Handle cases where values are just numbers (e.g., '60' = 60 minutes = '01:00:00')
    // or already in TIME format
    
    if (hasMinTime) {
      // Convert numeric values (assumed to be minutes) to TIME format
      // Example: '60' -> '01:00:00', '30' -> '00:30:00', '45' -> '00:45:00'
      await knex.raw(`
        UPDATE restaurants 
        SET min_food_processing_time = CASE
          WHEN min_food_processing_time IS NULL THEN NULL
          WHEN min_food_processing_time REGEXP '^[0-9]+$' THEN 
            CONCAT(
              LPAD(FLOOR(CAST(min_food_processing_time AS UNSIGNED) / 60), 2, '0'), 
              ':', 
              LPAD(MOD(CAST(min_food_processing_time AS UNSIGNED), 60), 2, '0'), 
              ':00'
            )
          WHEN min_food_processing_time REGEXP '^[0-9]{1,2}:[0-9]{2}(:[0-9]{2})?$' THEN 
            TIME(min_food_processing_time)
          ELSE NULL
        END
        WHERE min_food_processing_time IS NOT NULL
      `);
      
      // Now change the column type
      await knex.raw(`
        ALTER TABLE restaurants 
        MODIFY COLUMN min_food_processing_time TIME NULL
      `);
    }
    
    if (hasMaxTime) {
      // Convert numeric values (assumed to be minutes) to TIME format
      await knex.raw(`
        UPDATE restaurants 
        SET max_food_processing_time = CASE
          WHEN max_food_processing_time IS NULL THEN NULL
          WHEN max_food_processing_time REGEXP '^[0-9]+$' THEN 
            CONCAT(
              LPAD(FLOOR(CAST(max_food_processing_time AS UNSIGNED) / 60), 2, '0'), 
              ':', 
              LPAD(MOD(CAST(max_food_processing_time AS UNSIGNED), 60), 2, '0'), 
              ':00'
            )
          WHEN max_food_processing_time REGEXP '^[0-9]{1,2}:[0-9]{2}(:[0-9]{2})?$' THEN 
            TIME(max_food_processing_time)
          ELSE NULL
        END
        WHERE max_food_processing_time IS NOT NULL
      `);
      
      // Now change the column type
      await knex.raw(`
        ALTER TABLE restaurants 
        MODIFY COLUMN max_food_processing_time TIME NULL
      `);
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasTable = await knex.schema.hasTable("restaurants");
  
  if (hasTable) {
    const hasMinTime = await knex.schema.hasColumn("restaurants", "min_food_processing_time");
    const hasMaxTime = await knex.schema.hasColumn("restaurants", "max_food_processing_time");
    
    // Revert back to STRING type
    if (hasMinTime) {
      await knex.raw(`
        ALTER TABLE restaurants 
        MODIFY COLUMN min_food_processing_time VARCHAR(50) NULL
      `);
    }
    
    if (hasMaxTime) {
      await knex.raw(`
        ALTER TABLE restaurants 
        MODIFY COLUMN max_food_processing_time VARCHAR(50) NULL
      `);
    }
  }
}

