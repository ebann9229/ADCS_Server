/* eslint-disable no-undef */
const Customer = require('../../../models/customers');
const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');

describe('auth middleware', () => {
	it('should populate req.customer with the payload of a valid JWT', () => {
		const customer = { 
			_id: mongoose.Types.ObjectId().toHexString(),
		};
		const token = new Customer(customer).generateAuthToken();
		const req = {
			header: jest.fn().mockReturnValue(token)
		};
		const res = {};
		const next = jest.fn();

		auth(req, res, next);
        
		expect(req.user).toMatchObject(customer);
	});
});