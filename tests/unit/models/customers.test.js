/* eslint-disable no-undef */
const Customer = require('../../../models/customers');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('customer.generateAuthToken', () => {
	it('should return a valid JWT', () => {
		const payload = { _id: new mongoose.Types.ObjectId().toHexString() };
		const customer = new Customer(payload);
		const token = customer.generateAuthToken();
		const decode = jwt.verify(token, process.env.ADCS_PRIVATEKEY);
		expect(decode).toMatchObject(payload);
	});
});