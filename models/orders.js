const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
	customer: {
		type: new mongoose.Schema({
			username: {
				type: String,
				required: true,

			},
			phoneNumber: {
				type: String,
				required: true,
				trim: true,
			}
		}),
		required: true
	},
	items: [{
		item: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Item'
		},
		quantity: {
			type: Number,
			required: true
		}
	}],
	orderTime: {
		type: Date,
		default: Date.now
	},
	totalPrice: {
		type: Number,
		required: true
	},
	status: {
		type: String,
		enum: ['waiting', 'processing', 'done'],
		default: 'waiting'
	}
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;