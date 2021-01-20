const mongoose = require('mongoose');
require('dotenv').config();

const itemCountSchema = mongoose.Schema({
    item: {
        type: String,
        lowercase: true,
        required: true
    },
    count: {
        type: Number,
        required: true
    }
});


const ItemCount = mongoose.model('ItemCount', itemCountSchema);

module.exports = ItemCount;