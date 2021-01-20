/* eslint-disable no-undef */
const request = require('supertest');
const Order = require('../../models/orders');
const Customer = require('../../models/customers');
const Item = require('../../models/items');
const Admin = require('../../models/admins');

let server;

describe('/orders', () => {
	beforeEach(() => { server = require('../../index'); });
	afterEach(async () => { 
		await server.close(); 
		await Order.remove({});
		await Customer.remove({});
	});

	let token;
	let totalPrice;
	let balance;
	let id;

	describe('POST /', () => {
        
		const exec = async () => {
			return await request(server)
				.post('/orders')
				.set('x-auth-token', token)
				.send({ items, totalPrice });
		};

		beforeEach(() => {
			const customer = new Customer({
				username: 'customer1',
				email: 'customer@mail.com', 
				password: 'asdfgh', 
				confirmPassword: 'asdfgh', 
				phoneNumber: '0987654321', 
				balance: 100
			});
			customer.save();
			token = customer.generateAuthToken();
			id = customer._id;
			balance = 100;
			totalPrice = 50;
			let item = new Item();
			items = [{item: item, qty: 4}];
		});

		it('should return 400 if the total price exceeds the customer balance', async () => {
			totalPrice = 120;

			const res = await exec();
			expect(res.status).toBe(400);
		});

		it('should save the order and deduct the price from customer balance if everything is correct', async () => {
			const res = await exec();
			expect(res.status).toBe(200);
			const order = await Order.find({ 'customer.name' : 'customer1'});
			expect(order).not.toBeNull();

			const customerTw = await Customer.findById(id);
			expect(customerTw.balance).toEqual(balance - totalPrice);
		});

		it('should return the order if everything is correct', async (done) => {
			const res = await exec();
			expect(res.body).not.toBeNull;
			
			done();
		});

	});

	describe('GET /', () => {
        
		const exec = async () => {
			return await request(server)
				.get('/orders')
				.set('x-auth-token', token);
		};

		beforeEach(() => {
			const customer = new Customer({ username: 'customer1', email: 'customer@mail.com', password: 'asdfgh', confirmPassword: 'asdfgh', phoneNumber: '0987654321', isAdmin: 'true'});
			customer.save();
			const admin = new Admin({ username: 'admin1', password: 'asdfgh'});
			admin.save();
			const item = new Item();
			id = item._id;

			token = admin.generateAuthToken();
		});
        
		it('should return all orders', async () => {

			await Order.collection.insertMany([
				{
					customer: {username: 'customer1', phoneNumber: '0987654321'},
					items: [{item: id, quantity: 3}, {item: id, quantity: 2}],
					totalPrice: 50
				},
				{
					customer: {username: 'customer2', phoneNumber: '0982654321'},
					items: [{item: id, quantity: 3}, {item: id, quantity: 2}],
					totalPrice: 150
				}
			]);
    
			const res = await exec();

			expect(res.status).toBe(200);
			expect(res.body.length).toBe(2);
			expect(res.body.some(i => i.customer.username === 'customer1' )).toBeTruthy();
			expect(res.body.some(i => i.customer.username === 'customer2' )).toBeTruthy();
		});
	});

	describe('DELETE /:id', () => {
		
		const exec = async () => {
			return await request(server)
				.delete('/orders/' + id)
				.set('x-auth-token', token)
				.send();
		};

		beforeEach(async() => {
			const item = new Item();
			const order = new Order ({
				customer: {username: 'customer1', phoneNumber: '0987654321'},
				items: [{item: item._id, quantity: 3}, {item: item._id, quantity: 2}],
				totalPrice: 50
			});
			await order.save();

			customer = new Customer({ username: 'customer1', email: 'customer@mail.com', password: 'asdfgh', confirmPassword: 'asdfgh', phoneNumber: '0987654321', balance: 0});
			customer.save();

			token = customer.generateAuthToken();			
			id = order._id;
		});

		it('should delete the order if everything is correct', async () => {
			const res = await exec();
			const orderInDb = await Order.findById(id);
			expect(res.body).toBeNull();
			expect(orderInDb).toBeNull();
		});
	});

});