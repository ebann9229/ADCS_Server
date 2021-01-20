const express = require('express');
const router = new express.Router();

const Customer = require('../models/customers');

router.get('/:token', async (req, res) => {
	const customer = await Customer.findOne({ 
		resetPasswordToken: req.params.token,
		resetPasswordExpiry: {
			$gt: Date.now()
		}
	});
	if(!customer) return res.status(404).send('password reset link is invalid or has been expired');

	res.send({
		token : customer.resetPasswordToken,
		message: 'password reset link is ok'
	});
});

module.exports = router;