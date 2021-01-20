const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminSchema = mongoose.Schema({
    username: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

adminSchema.methods.generateAuthToken = function () {
    // eslint-disable-next-line no-undef
    const token = jwt.sign({isAdmin: true, id: this._id}, process.env.ADCS_PRIVATEKEY);
    return token;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;