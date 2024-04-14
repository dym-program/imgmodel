const express = require('express');
const apiRoutes = require('./routes/api');

const app = express();
const { IMAGES_PATH, MODELS_PATH } = require('./config');

app.use('/images', express.static(__dirname + IMAGES_PATH));
app.use('/models', express.static(__dirname + MODELS_PATH));
app.use('/api', apiRoutes);

module.exports = app;
