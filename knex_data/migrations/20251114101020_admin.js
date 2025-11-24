/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
    export async function up(knex) {
        await knex.schema.createTable('admin', function (table) {
            table.increments("id").primary();
            table.string('image', 255).notNullable().defaultTo('assets/others/default-img.webp');
            table.string('name', 255).notNullable();
            table.string('email', 255).notNullable().unique();
            table.string('password', 255).notNullable();
            table.string('role', 255).notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now()).nullable();
            table.timestamp('updated_at').defaultTo(knex.fn.now()).nullable();
            table.timestamp('deleted_at').nullable();
        });
    }
    /**
     * @param { import("knex").Knex } knex
     * @returns { Promise<void> }
     */
    export async function down(knex) {
        await knex.schema.dropTableIfExists('admin');
    }
