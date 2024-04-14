// src/components/ModelViewer/ModelViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { API_BASE_URL } from '../config';  // 导入基础URL配置

const ModelViewer = () => {
    const mountRef = useRef(null);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const loadImages = async () => {
            const { data } = await axios.get(`${API_BASE_URL}/api/images`);
            setImages(data);
        };

        loadImages();
    }, []);

    useEffect(() => {
        if (images.length === 0) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        // 创建圆柱体
        const geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        const cylinder = new THREE.Mesh(geometry, material);
        scene.add(cylinder);

        // 加载图片
        const textureLoader = new THREE.TextureLoader();
        const planeGeometry = new THREE.PlaneGeometry(4, 4);
        images.forEach((img, index) => {
            textureLoader.load(`${API_BASE_URL}/images/${img}`, (texture) => {
                const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
                const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
                planeMesh.position.set(10 * Math.sin(0.5 * index), 0, 10 * Math.cos(0.5 * index));
                scene.add(planeMesh);
            });
        });

        // 控制器
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;

        // 设置相机位置
        camera.position.set(0, 0, 30);
        controls.update();

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            mountRef.current.removeChild(renderer.domElement);
        };
    }, [images]);

    return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ModelViewer;
