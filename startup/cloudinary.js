/* eslint-disable no-undef */
const cloudinary = require('cloudinary');
require ('dotenv').config();

cloudinary.config({
    cloud_name: "dasherdelivery",   // process.env.CLOUD_NAME,
    api_key: "289739416844276",       //process.env.CLOUDINARY_API_KEY,
    api_secret: 'lUK8HI98wayFz7FCjAnCIWwg1FU' //process.env.CLOUDINARY_API_SECRET
});


module.exports = cloudinary;