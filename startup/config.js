require('dotenv').config();

module.exports = function () {
	// eslint-disable-next-line no-undef
	if (!process.env.ADCS_PRIVATEKEY) {
		throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
	}
};