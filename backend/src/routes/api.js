const express = require('express');
const fs = require('fs');
const path = require('path');
const { IMAGES_PATH, MODELS_PATH } = require('../config');

const router = express.Router();

router.get('/images', (req, res) => {
    fs.readdir(path.join(__dirname, '..', '..', IMAGES_PATH), (err, files) => {
        if (err) {
            return res.status(500).send('Error reading images directory.');
        }
        res.json(files);
    });
});

router.get('/models', (req, res) => {
    fs.readdir(path.join(__dirname, '..', '..', MODELS_PATH), (err, files) => {
        if (err) {
            return res.status(500).send('Error reading models directory.');
        }
        res.json(files);
    });
});

module.exports = router;
