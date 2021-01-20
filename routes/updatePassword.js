const express = require('express');
const bcrypt = require('bcrypt');
const router = new express.Router();

const Customer = require('../models/customers');

router.put('/', async (req, res) => {
	const salt = await bcrypt.genSalt(10);
	const newPassword = await bcrypt.hash(req.body.password, salt);
	const customer = await Customer.findOneAndUpdate(
		{resetPasswordToken: req.body.token},
		{ 
			password: newPassword, 
			resetPasswordToken: null, 
			resetPasswordExpiry: null
		});
	if(!customer) return res.status(404).send('The customer is not found');
    
	res.status(200).send('Password updated successfully');
});

module.exports = router;