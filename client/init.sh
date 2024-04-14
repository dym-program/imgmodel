#!/bin/bash

# 定义项目名
PROJECT_NAME="imgmodel"

# 使用 create-react-app 创建项目
npx create-react-app $PROJECT_NAME

# 进入项目目录
cd $PROJECT_NAME

# 创建额外的目录结构
mkdir -p src/components/Header
mkdir -p src/components/Footer
mkdir -p src/components/ImageGallery
mkdir -p src/components/ModelViewer
mkdir -p src/components/ModelInfo
mkdir -p src/components/CommentSection
mkdir -p src/assets/images
mkdir -p src/assets/models
mkdir -p src/utils

# 创建CSS和JSX文件
touch src/components/Header/Header.jsx
touch src/components/Header/header.css
touch src/components/Footer/Footer.jsx
touch src/components/Footer/footer.css
touch src/components/ImageGallery/ImageGallery.jsx
touch src/components/ImageGallery/imageGallery.css
touch src/components/ModelViewer/ModelViewer.jsx
touch src/components/ModelViewer/modelViewer.css
touch src/components/ModelInfo/ModelInfo.jsx
touch src/components/ModelInfo/modelInfo.css
touch src/components/CommentSection/CommentSection.jsx
touch src/components/CommentSection/commentSection.css

# 创建工具脚本文件
touch src/utils/helpers.js

echo "项目 $PROJECT_NAME 初始化完成，目录结构已创建。"

