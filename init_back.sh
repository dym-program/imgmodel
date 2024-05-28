#!/bin/bash

# 创建后端目录结构
mkdir -p backend/src/routes

mkdir -p backend/public/images

mkdir -p backend/public/models



# 创建文件
echo "const express = require('express');
const apiRoutes = require('./routes/api');

const app = express();
const { IMAGES_PATH, MODELS_PATH } = require('./config');

app.use('/images', express.static(__dirname + IMAGES_PATH));
app.use('/models', express.static(__dirname + MODELS_PATH));
app.use('/api', apiRoutes);

module.exports = app;" > backend/src/app.js

echo "const express = require('express');
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

module.exports = router;" > backend/src/routes/api.js

echo "module.exports = {
    PORT: 3001,
    IMAGES_PATH: '/public/images',
    MODELS_PATH: '/public/models'
};" > backend/src/config.js

echo "const app = require('./src/app');
const { PORT } = require('./src/config');

app.listen(PORT, () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
});" > backend/server.js

# 初始化Node.js项目
cd backend
npm init -y
npm install express

# 信息输出
echo "后端服务已设置完成。"

