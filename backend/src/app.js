const express = require('express');
const apiRoutes = require('./routes/api');
const cors = require('cors');
const path = require('path');
const app = express();
const { IMAGES_PATH, MODELS_PATH } = require('./config');

app.use(cors());
app.use('/images', express.static(path.join(__dirname, IMAGES_PATH)));
app.use('/models', express.static(path.join(__dirname, MODELS_PATH)));
app.use('/public/images', express.static(path.join(__dirname, 'public/images')));
app.use('/api', apiRoutes);
app.use('/public/images', express.static(path.join(__dirname, 'public', 'images')));
console.log(path.join(__dirname, 'public', 'images'));
app.use('/public/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/public/images', (req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    next();
}, express.static(path.join(__dirname, 'public', 'images')));
module.exports = app;
