const express = require('express');
const cors = require('cors');
const compression = require('compression');

const error = require('../middleware/error');
const customerRouter = require('../routes/customers');
const itemRouter = require('../routes/items');
const orderRouter = require('../routes/orders');
const forgotPasswordRouter = require('../routes/forgotPassword');
const resetRouter = require('../routes/resetPassword');
const updatePasswordRouter = require('../routes/updatePassword');
const adminRouter = require('../routes/admins');

module.exports = function(app) {
	app.use(cors());
	app.use(express.json());
	app.use(compression());
	app.use('/admin', adminRouter);
	app.use('/customers', customerRouter);
	app.use('/items', itemRouter);
	app.use('/orders', orderRouter);
	app.use('/forgotpassword', forgotPasswordRouter);
	app.use('/reset', resetRouter);
	app.use('/updatePassword', updatePasswordRouter);
	
	app.use(error);
};