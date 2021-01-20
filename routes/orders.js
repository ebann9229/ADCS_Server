const express = require('express');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const router = new express.Router();

const validateObjectId = require('../middleware/validateObjectId');
const Order = require('../models/orders'); 
const Customer = require('../models/customers');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

Fawn.init(mongoose);

//end point to add new order
router.post('/', auth, async (req, res) => {
	const customer = await Customer.findById(req.user._id);
	if (!customer) return res.status(404).send("Cant find the user");

	let order = new Order({
		customer: {
			username: customer.username,
			phoneNumber: customer.phoneNumber
		},
		items: req.body.items,
		totalPrice: req.body.totalPrice
	});

	if (order.totalPrice > customer.balance) 
		return res.status(400)
			.send(`Customer don't have enough balance. Current balance ${customer.balance}`);
	
	const pendingOrders = await Order.find({status: 'waiting'}).countDocuments();
	
	new Fawn.Task()
		.update('customers', { _id: customer._id }, {
			$inc: { balance: -order.totalPrice }
		})
		.save('orders', order)
		.run();

	res.send({'no of orders in queue': pendingOrders});
});

//endpoint to get all  orders
// GET /?status=waiting
// GET /?limit=5&skip=10
// GET /?sort=orderTime:desc
router.get('/', [auth, isAdmin], async (req, res) => {

	let match = {};
	let sort = {};

	if (req.query.status) {
		match.status = req.query.status
	}

	if (req.query.sortBy) {
		const part = req.query.sortBy.split(':');
		sort = part[1] === 'desc' ? '-'+part[0] : part[0];
	}

	const orders = await Order
			.find(match)
			.sort(sort)
			.limit(parseInt(req.query.limit))
			.skip(parseInt(req.query.skip))
			.populate('items.item', 'name price');

	res.send(orders);
});


//end point to cancel a specific order
router.delete('/:id', [auth, validateObjectId], async (req, res) => {
	const order = await Order.findById(req.params.id); 
	if (!order) return res.status(404).json({order: 'The order with the given id was not found'});

	const customer = await Customer.findById(req.user._id);
	if (!customer) return res.status(404).json({general: 'Could not find the user'});
	if (order.customer.username !== customer.username) return res.status(401).json({general:'Access denied'});
	if (order.status !== 'waiting') return res.status(400).json({general:'The order has already been started'});
    
	const price = order.totalPrice;
    
	new Fawn.Task()
		.remove('orders', {_id: order._id})
		.update('customers', {_id: customer._id}, {
			$inc: { balance: price }
		})
		.run();

	res.send(customer);
});


//end point to find orders for a specific customer
router.get('/myorders', auth, async (req, res) => {
	const customer = await Customer.findById(req.user._id);

	const order = await Order.find({'customer.username': customer.username});
	if (order.length === 0) return res.json({order:'You have no orders'});

	res.send(order);
});


//end point to update the status of an order
router.patch('/:id', [validateObjectId, auth, isAdmin], async (req, res) => {
	const order = await Order.findByIdAndUpdate(req.params.id, {
		status: req.body.status },{
		new: true 
	});

	if (!order) return res.status(404).json({order:'The order with the given id was not found'});

	res.send(order);
});


module.exports = router;