import winston from "winston";

export default winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple()
    ),
    defaultMeta: { service: "user-service" },
    transports: [
        new winston.transports.Console({
            level: "info"
        }),
        new winston.transports.File({
            level:"warn",
            filename:"log.log",
            format: winston.format.json()
        })
    ]
})
/**
 {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}
 */
