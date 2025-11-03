import config from "./src/common/config/envConfig.js";

export default {
  development: {
    client: "mysql2",
    connection: {
      host: config.DB_HOST,
      user: config.DB_USER, 
      password: config.DB_PASSWORD, 
      database: config.DB_NAME,
      port: config.DB_PORT,
    },
    migrations: {
      directory: "./knex_data/migrations",
    },
    seeds: {
      directory: "./knex_data/seeds",
    },
  },
};
