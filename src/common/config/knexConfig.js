import knex from "knex";
import knexConfig from '../../../knexfile.js';

const knexConfig = knex(config.development);

export default knexConfig;
