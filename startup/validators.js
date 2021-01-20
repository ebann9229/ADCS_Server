const validator = require('validator');

exports.validateSignupData = (data) => {
	let errors = {};

	if (!data.username) errors.username = 'Must not be empty';
	else if (validator.isEmpty(data.username)) errors.username = 'Must not be empty';
	if(data.username.length < 5) errors.username = 'Must be more than four characters'; 
	if(data.username.length > 20) errors.username = 'Must be less than twenty characters';
	
	if (!data.password) errors.password = 'Must not be empty';
	else if (validator.isEmpty(data.password)) errors.password = 'Must not be empty';
	if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords must match';

	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false
	};
};

exports.validateLoginData = (data) => {
	let errors = {};

	if (!data.username) errors.username = 'Must not be empty';
	else if (validator.isEmpty(data.username)) errors.username = 'Must not be empty';

	if (!data.password) errors.password = 'Must not be empty';
	else if (validator.isEmpty(data.password)) errors.password = 'Must not be empty';

	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false
	};
};


exports.validateItemData = (data) => {
	let errors = {};

	if (!data.name) errors.name = 'Must not be empty';
	else if (validator.isEmpty(data.name)) errors.name = 'Must not be empty';

	if (!data.price) errors.price = 'Must not be empty';
	else if (validator.isEmpty(data.price)) errors.price = 'Must not be empty';
	else if (!validator.isFloat(data.price, {gt: 1})) errors.price = 'Must be a positive number';

	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false
	};
};

exports.validateOrderStatus = (data) => {
	let errors = {};

	if (!data.status) errors.status = 'Must not be empty';
	else if (validator.isEmpty(data.status)) errors.status = 'Must not be empty';

	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false
	}
};
