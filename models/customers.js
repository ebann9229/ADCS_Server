const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const customerSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 50,
		trim: true,
		lowercase: true,
		unique: 1,
	},
	email:{
		type: String,
		trim: true,
		lowercase: true,
	},
	password:{
		type: String,
		required: true,
		minlength: 6,
		maxlength: 1024
	},
	phoneNumber: {
		type: String,
		trim: true,
		unique: 1,
	},
	balance: {
		type: Number,
		default: 0,
		min: 0
	},
	resetPasswordToken: {
		type: String,
		default: null
	},
	resetPasswordExpiry: {
		type: String,
		default: null
	}
});

customerSchema.methods.generateAuthToken = function () {
	// eslint-disable-next-line no-undef
	const token = jwt.sign({ _id: this._id }, process.env.ADCS_PRIVATEKEY);
	return token;
};


const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;