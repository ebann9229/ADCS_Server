require('express-async-errors');
const winston = require('winston');

module.exports = function () {
	// eslint-disable-next-line no-undef
	process.on('unhandledRejection', (ex) => {
		throw ex;
	});
	
	const logger = winston.createLogger({
		level: 'info',
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.json(),
			winston.format.timestamp(),
			winston.format.prettyPrint()
		),
		transports: [
			new winston.transports.Console()
		],
		exceptionHandlers: [
			new winston.transports.File({ filename: 'exception.log', level: 'alert'}),
			new winston.transports.Console()
		]
	});

	winston.add(logger);
};
// 	winston.exceptions.handle(
// 		new winston.transports.File({ filename: 'uncaughtExceptionLogger.log'})
// 	);    
// 	winston.format.colorize();
// 	winston.format.prettyPrint();
// 	winston.add( 
// 		new winston.transports.Console({ colorize:true, prettyPrint: true },
// 			new winston.transports.File({ filename: 'logger.log'})
// 		)
// 	);
   
// };
   