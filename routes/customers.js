const express = require('express');
const bcrypt = require('bcrypt');
const router = new express.Router();

const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const  Customer = require('../models/customers');
const {
	validateSignupData,
	validateLoginData
} = require('../startup/validators.js');


//end point to register a new customer
router.post('/', async (req, res) => {
	//check if the input data is valid
	const { valid, errors } = validateSignupData(req.body);
	if (!valid) return res.status(400).json(errors);

	//check if the username is already in use
	let customer = await Customer.findOne({username: req.body.username});
	if (customer) return res.status(400).json({username: 'The username is already in use'});
   
	customer = new Customer({
		username: req.body.username,
		password: req.body.password,
		phoneNumber: req.body.phoneNumber,
		email: req.body.email
	});

	//hash the password
	const salt = await bcrypt.genSalt(10);
	customer.password = await bcrypt.hash(customer.password, salt);
	await customer.save();

	const token = customer.generateAuthToken();
	res.send(token);
});


//end point to log a customer in
router.post('/login', async(req, res) => {
	//check if the input data is valid
	const { valid, errors } = validateLoginData(req.body);
	if (!valid) return res.status(400).json(errors);

	//check if the customer is using the right credentials
	const customer = await Customer.findOne({'username': req.body.username});
	if (!customer) return res.status(400).json({general: 'Incorrect username or password'});
    
	const match = await bcrypt.compare(req.body.password, customer.password);
	if (!match) return  res.status(400).json({general: 'Incorrect username or password'});

	const token = customer.generateAuthToken();
	res.send(token);
});


//end point to return one's own customer info
router.get('/me', [auth], async (req, res) => {
	const customer = await Customer.findById(req.user._id).select('-password');
	if (!customer) return res.status(404).json({general: 'The user no longer exist'});
   
	res.send(customer); 
});


//end point to return all the customers
router.get('/', [auth, isAdmin], async (req, res) => {
	const customers = await Customer.find().sort('username').select('-password');
	if (customers.length === 0) return res.send('There are no customers in the database');

	res.send(customers);
});


//end point to change the customer balance
router.patch('/balance/:id', [auth, isAdmin, validateObjectId], async (req, res) => {
	const customer = await Customer.findByIdAndUpdate(req.params.id, { balance: req.body.balance }, { new: true }).select('-password');

	res.send(customer);
});


//end point to delete a customer
router.delete('/me', auth, async (req, res) => {
	const customer = await Customer.findById(req.user._id);
	if(!customer) return res.status(404).send('The user no longer exist');

	const match = await bcrypt.compare(req.body.password, customer.password);
	if(!match) return res.status(400).send('Incorrect Password');

	customer.deleteOne();
	res.send('User deleted successfully')
});

//endpoint to delete a customer from admin side
router.delete('/:id', [auth, isAdmin, validateObjectId], async (req, res) => {
	const customer = await Customer.findById(req.params.id);
	if(!customer) return res.status(404).send('The customer with the specified id was not found');
	if(customer.balance !== 0) return res.status(400).send('Can not delete an active customer');

	customer.deleteOne();
	res.send('Customer deleted successfully');
});


//end point to find a customer by username
// router.get('/customer', [auth, isAdmin], async (req, res) =>{
// 	const customer = await Customer.findOne({ username: req.body.username}).select('-password');
// 	if (!customer) return res.status(404).send('The customer with the specified username was not found');

// 	res.send(customer);
// });


module.exports = router;

