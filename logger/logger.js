const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;
require('winston-daily-rotate-file');

//https://github.com/winstonjs/winston-daily-rotate-file
var errorTransport = new (transports.DailyRotateFile)({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    level: 'error',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });
  var commonTransport = new (transports.DailyRotateFile)({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });

const logger = createLogger({
    format: combine(
     format.json(),
     timestamp(),
     prettyPrint()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        errorTransport,
        commonTransport
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
      format: format.simple()
    }));
  }

module.exports = logger;