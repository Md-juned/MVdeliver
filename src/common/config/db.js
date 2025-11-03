import mysql2 from 'mysql2';
import config from './envConfig.js'

export default {
  url: `mysql://${encodeURIComponent(config.DB_USER)}:${encodeURIComponent(config.DB_PASSWORD)}@${config.DB_HOST}/${config.DB_NAME}`,
  host: config.DB_HOST,
  dialectModule: mysql2,
  dialect: 'mysql',
  pool: {
    min: 0,
    max: 10,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true, 
  },
};