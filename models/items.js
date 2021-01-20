const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: 1
	},
	tags: {
		type: [String]
	},
	description: {
		type: String
	},
	price: {
		type: Number,
		min: 1,
		required: true
	},
	imgUrl: {
		type: String,
		default: 'noImg.jpg'
	},
	availability: {
		type: Boolean,
		default: true
	}
	
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;