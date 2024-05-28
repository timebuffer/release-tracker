const winston = require('winston');
const { format, transports } = winston;

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { service: 'github-releases-tracker' },
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' })
  ],
});

module.exports = logger;
