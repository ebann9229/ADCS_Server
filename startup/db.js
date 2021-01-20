const mongoose = require('mongoose');
const winston = require('winston');
require('dotenv').config();

module.exports = function () {
	const db = 'mongodb://127.0.0.1/27017';
	mongoose.connect(db, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true
	})
	.then(() => winston.info(`Connected to ${db}....`));
};