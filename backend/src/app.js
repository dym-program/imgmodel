const express = require('express');
const apiRoutes = require('./routes/api');
const cors = require('cors');
const path = require('path');
const app = express();
const { IMAGES_PATH, MODELS_PATH } = require('./config');

app.use(cors());
app.use('/images', express.static(path.join(__dirname, IMAGES_PATH)));
app.use('/models', express.static(path.join(__dirname, MODELS_PATH)));
app.use('/api', apiRoutes);
app.use('/test.png', express.static(path.join(__dirname, 'test.png')));

module.exports = app;
