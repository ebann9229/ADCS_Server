const express = require('express');
const app = express();
require('dotenv').config();

require('./startup/logging')();
require('./startup/route')(app);
require('./startup/db')();
require('./startup/config')();

// eslint-disable-next-line no-undef
const port = process.env.PORT || 3002;
const server = app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = server;