const express = require('express');
const bcrypt = require('bcrypt');
const router = new express.Router();

// Models
const Admin = require('../models/admins');

// Utils
const { validateSignupData } = require('../startup/validators');

//endpoint to register admin
router.post('/', async(req, res) => {
    
    const { valid, errors } = validateSignupData(req.body);
    if(!valid) return res.status(400).json(errors);

    let admin = new Admin(req.body);
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    await admin.save();

    const token = admin.generateAuthToken();
    res.send(token);
});

router.post('/login', async(req, res) => {
    // const { valid, errors } = validateLoginData(req.body);
    // if (!valid) return res.status(404).json(errors);

    const admin = await Admin.findOne({username: req.body.username});
    if (!admin) return res.status(400).json({general: 'Incorrect username or password'});

    const match = await bcrypt.compare(req.body.password, admin.password);
    if (!match) return res.status(400).json({general: 'Incorrect username or password'});

    const token = admin.generateAuthToken();
    res.send(token);
});

module.exports = router;