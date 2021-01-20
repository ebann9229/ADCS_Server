const express = require('express');
const router = new express.Router();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const validateObjectId = require('../middleware/validateObjectId');
const Item = require('../models/items');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { validateItemData } = require('../startup/validators.js');
const cloudinary = require('../startup/cloudinary');

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	allowedFormats: ["jpg", "png"],
	transformation: [{ width: 500, height: 500, crop: 'limit'}],
	folder: 'Items'
});

const parser = multer({ storage: storage });

//end point to add a new item
router.post('/', [auth, isAdmin], async (req, res) => {
	const { valid, errors } = validateItemData(req.body);
	if (!valid) return res.status(400).json(errors);

	//check if the item name is already in use
	let item = await Item.findOne({name: req.body.name});
	if (item) return res.status(400).json({name: 'The name is already in use'});

	item = new Item({
		name: req.body.name,
		tags: req.body.tags,
		description: req.body.description,
		price: req.body.price
	});

	await item.save();

	res.send(item);
});

// endpoint to upload an image
router.put('/upload/:id', parser.single('image'), async(req, res) => {
	const image = req.file;
	if (!image) return res.status(400).send('Must provide an image');
	const item = await Item.findByIdAndUpdate(req.id, {imgUrl: image.fieldname}, { new: true });
	if (!item) return res.status(400).send('Couldnot find the specified image');

	res.send(item);
});

//end point to get all the item
router.get('/', async (req, res) => {

	let match, sort;

	if (req.query.tags) {
		match.tags = req.query.tags
	}

	if (req.query.sortBy) {
		const part = req.query.sortBy.split(':');
		sort = part[1] ==='desc' ? '-'+part[0] : part[0];
	}

	const items = await Item
			.find(match)
			.sort(sort)
			.limit(parseInt(req.query.limit))
			.skip(parseInt(req.query.skip));

	res.send(items);
});


//end point to get a specific item by id
router.get('/:id', validateObjectId, async (req, res) => {
	const item = await Item.findById(req.params.id);
	if (!item) return res.status(404).send('The item with the specified id was not found.');

	res.send(item);
});

//end point to update item info
router.patch('/:id', [ auth, isAdmin, validateObjectId ], async (req, res) => {
	const item = await Item.findByIdAndUpdate(req.params.id, { 
		name: req.body.name,
		tags: req.body.tags,
		description: req.body.description,
		price: req.body.price,
	}, { new: true });
	if (!item) return res.status(404).send('The item with the specified id was not found');

	res.send(item);
});


//end point to delete a specific item
router.delete('/:id', [auth, isAdmin, validateObjectId], async (req, res) => {
	const item = await Item.findByIdAndDelete(req.params.id);
	if(!item) return res.status(404).send('The item with the given id was not found.');

	res.send(item);
});

//endpoint to change the status of the item
router.put('/:id', [auth, isAdmin, validateObjectId], async (req, res) => {
	const item = await Item.findByIdAndUpdate(req.params.id, {availability: !item.availability}, {new: true})
	if(!item) return res.status(404).send('The item with the given id was not found.');

	res.send(item.availability);
});

module.exports = router;