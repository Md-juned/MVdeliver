import fs from "fs";
import stringify from "safe-json-stringify";
import winston from "winston";
const logDir = "debuglogs";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "./src/common/config/envConfig.js";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
  fs.chmodSync(logDir, 777);
}

// emerg | alert | crit | error | warning | notice | info | debug
const logLevel = "debug";
const loglevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};
const logger = winston.createLogger({
  level: logLevel,
  levels: loglevels,
  format: winston.format.combine(
    winston.format.errors({
      stack: true,
    }),
    winston.format.prettyPrint(),
    winston.format.timestamp({
      format: "DD-MM-YYYY hh:mm:ss A",
    }),
    winston.format.json(),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...args } = info;
      return `${timestamp} ${level}: ${message} ${
        Object.keys(args).length ? stringify(args, null, 2) : ""
      }`;
    })
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: `${logDir}/api/%DATE%.log`,
      datePattern: "DDMMMYYYY",
      handleExceptions: true,
      // @ts-ignore
      prettyPrint: true,
      json: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: `${logDir}/exceptions/%DATE%.log`,
      datePattern: "DDMMMYYYY",
      // @ts-ignore
      prettyPrint: true,
      handleExceptions: true,
      json: true,
    }),
  ],
  exitOnError: true,
});

if (config.NODE_ENV != "prod") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.errors({
          stack: true,
        }),
        winston.format.prettyPrint(),
        winston.format.timestamp({
          format: "DD-MM-YYYY hh:mm:ss A",
        }),
        winston.format.json(),
        winston.format.printf((info) => {
          const { timestamp, level, message, ...args } = info;
          return `${timestamp} ${level}: ${message} ${
            Object.keys(args).length ? stringify(args, null, 2) : ""
          }`;
        })
      ),
    })
  );
}

export default logger;