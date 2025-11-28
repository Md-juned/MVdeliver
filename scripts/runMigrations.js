import knex from "knex";
import knexfile from "../knexfile.js";

const db = knex(knexfile.development);

db.migrate
  .latest()
  .then(() => {
    console.log("Migrations ran successfully");
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    return db.destroy();
  });



