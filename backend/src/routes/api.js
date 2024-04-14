const express = require('express');
const fs = require('fs');
const path = require('path');
const { IMAGES_PATH, MODELS_PATH } = require('../config');  // 确保这里的变量名与config.js中定义的一致

const router = express.Router();

// 获取图片列表
router.get('/images', (req, res) => {
    // 修正路径，确保正确地从config文件中读取路径
    fs.readdir(path.join(__dirname, '..', IMAGES_PATH), (err, files) => {
        if (err) {
            console.error('Error reading images directory:', err); // 输出错误日志以便调试
            return res.status(500).send('Error reading images directory.');
        }
        res.json(files);
    });
});

// 获取模型列表
router.get('/models', (req, res) => {
    // 修正路径，确保正确地从config文件中读取路径
    fs.readdir(path.join(__dirname, '..', MODELS_PATH), (err, files) => {
        if (err) {
            console.error('Error reading models directory:', err); // 输出错误日志以便调试
            return res.status(500).send('Error reading models directory.');
        }
        res.json(files);
    });
});

module.exports = router;
