/* eslint-disable no-undef */
const request = require('supertest');
const Item = require('../../models/items');
const Customer = require('../../models/customers');
const Admin = require('../../models/admins');
const mongoose = require('mongoose');

let server;

describe('/items', () => {
	beforeEach(() => { server = require('../../index'); });
	afterEach(async () => { 
		await server.close(); 
		await Item.remove({});
		await Customer.remove({});
	});

	describe('GET /', () => {
		it('should return all items', async () => {
			await Item.collection.insertMany([
				{ name: 'pasta', price: 40 },
				{ name: 'pasta2', price: 30 }
			]);

			const res = await request(server).get('/items');

			expect(res.status).toBe(200);
			expect(res.body.length).toBe(2);
			expect(res.body.some(i => i.name === 'pasta' )).toBeTruthy();
			expect(res.body.some(i => i.name === 'pasta2' )).toBeTruthy();
		});
	});


	describe('GET /:id', () => {
		it('should return the specified item if valid id is given', async () => {
			const item = new Item({ name: 'pasta', price: 40 });
			await item.save();

			const res = await request(server).get('/items/' + item._id);
            
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('name', item.name);
			expect(res.body).toHaveProperty('price', item.price);
		});

		it('should return 404 if invalid id is given', async () => {
        
			const res = await request(server).get('/items/1');       
			expect(res.status).toBe(404);
		});

		it('should return 404 if the item with the given id is not found', async () => {
            
			const id = new mongoose.Types.ObjectId();
			const res = await request(server).get('/items/' + id);

			expect(res.status).toBe(404);
		});
	});


	describe('POST /',  () => {

		let token;
		let name;
		let price;

		const exec = async () => {
			return await request(server)
				.post('/items')
				.set('x-auth-token', token)
				.send({ name, price });
		};

		beforeEach(() => {
			const admin = new Admin({
				username: 'admin1', 
				email: 'admin@mail.com', 
				password: 'asdfgh', 
				confirmPassword: 'asdfgh', 
				phoneNumber: '0987654321', 
			});
			admin.save();

			token = admin.generateAuthToken();
			name = 'item';
			price = '30'; 
		});

		it('should return 401 if client is not logged in', async () => {
			token = '';

			const res = await exec();

			expect(res.status).toBe(401);
		});

		it('should return 403 if client is not an admin', async () => {
            
			token = new Customer().generateAuthToken();

			const res = await exec();

			expect(res.status).toBe(403);
		});

		it('should return 400 if item input is invalid', async () => {
			name = '';
			price = '';
			const res = await exec();

			expect(res.status).toBe(400);
		});

		it('should save the item if item input is valid', async () => {
        
			await exec();

			const item = await Item.find({ name: 'item1' });

			expect(item).not.toBeNull();
		});

		it('should return the item if item input is valid', async () => {
          
			const res = await exec();

			expect(res.body).toHaveProperty('_id');
			expect(res.body).toHaveProperty('name', 'item');
		});
	});


	describe('PATCH /:id', () => {
		let item;
		let admin;
		let newName;
		let newTag;
		let newDescription;
		let newPrice;
		let id;
		let token;

		const exec = async () => {
			return await request(server)
				.patch('/items/' + id)
				.send({
					name: newName,
					tags: newTag,
					description: newDescription,
					price: newPrice
				})
				.set('x-auth-token', token);
		};

		beforeEach(async () => {
			item = new Item({ name: 'item1', price: 30 });
			await item.save();

			admin = new Admin({ username: 'admin1', password: 'asdfgh', confirmPassword: 'asdfgh'});
			admin.save();
			

			token = admin.generateAuthToken();
			id = item._id;

			newName = 'item2';
			newTag = 'lunch';
			newDescription = 'this is lunch';
			newPrice = 50;
		});
		it('should return 401 if the customer is not logged in', async () => {
			token = '';
            
			const res = await exec();
			expect(res.status).toBe(401);
		});

		it('should return 403 if the customer is not an admin', async () => {
			token = new Customer().generateAuthToken();
            
			const res = await exec();
			expect(res.status).toBe(403);
		});

		it('should return 404 if id is invalid', async () => {
			id = 1;
            
			const res = await exec();

			expect(res.status).toBe(404);
		});

		it('should return 404 if the item with the specified id was not found', async () => {
			id = mongoose.Types.ObjectId();
            
			const res = await exec();
			expect(res.status).toBe(404);
		});

		it('should update the item if input is valid', async () => {
            
			await exec();
			const updatedItem = await Item.findById(item._id);
			expect(updatedItem.name).toBe(newName);
			expect(updatedItem.tags).toBe([newTag]);
			expect(updatedItem.description).toBe(newDescription);
			expect(updatedItem.price).toBe(newPrice);
            
		});

		it('should return the updated item if it is valid', async () => {
          
			const res = await exec();
			expect(res.body).toHaveProperty('_id');
			expect(res.body).toHaveProperty('name', newName);
		});

	});


	describe('DELETE /:id', () => {
		let item;
		let id;
		let token;

		const exec = async () => {
			return await request(server)
				.delete('/items/' + id)
				.set('x-auth-token', token)
				.send();
		};

		beforeEach(async () => {
			item = new Item({ name: 'item1', price: 30 });
			await item.save();

			admin = new Admin({ username: 'admin1',password: 'asdfgh', confirmPassword: 'asdfgh'});
			admin.save();

			token = admin.generateAuthToken();
			id = item._id;
		});

		it('should return 401 if the admin is not logged in', async () => {
			token = ''; 
			const res = await exec();
			expect(res.status).toBe(401);
		});

		it('should return 403 if the user is not an admin', async () => {
			token = new Customer().generateAuthToken();
			const res = await exec();
			expect(res.status).toBe(403);
		});

		it('should return 404 if id is invalid', async () => {
			id = 1;
			const res = await exec();
			expect(res.status).toBe(404);
		});

		it('should return 404 if the item with the specified id was not found', async () => {
			id = mongoose.Types.ObjectId(); 
			const res = await exec();
			expect(res.status).toBe(404);
		});

		it('should delete the item if input is valid', async () => {
			await exec();
			const itemInDb = await Item.findById(item._id);
			expect(itemInDb).toBeNull();
		});

		it('should return the deleted item if it is valid', async () => {
			const res = await exec();
			expect(res.body).toHaveProperty('_id', item._id.toHexString());
			expect(res.body).toHaveProperty('name', item.name);
		});

	});
});

