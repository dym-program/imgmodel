import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { IMAGE_BASE_URL, API_BASE_URL } from '../../config';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ModelViewer = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene()); // 使用一个共享的场景引用
  const [images, setImages] = useState([]);
  const cameraRef = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true, alpha: true }));

  useEffect(() => {
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setClearColor(0x000000, 0); // 透明背景
    mountRef.current.appendChild(rendererRef.current.domElement);
    new OrbitControls(cameraRef.current, rendererRef.current.domElement);

    cameraRef.current.position.z = 500; // 调整相机位置

    const ambientLight = new THREE.AmbientLight(0x404040); // 添加环境光
    sceneRef.current.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x9932CC, 1.5, 1000, Math.PI / 4, 0.5, 2);
    spotLight.position.set(0, 0, 100);
    spotLight.target.position.set(0, 100, 0);
    sceneRef.current.add(spotLight);
    sceneRef.current.add(spotLight.target);

    const loadImages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/images`);
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    loadImages();

    const animate = () => {
      sceneRef.current.rotation.y += 0.01; // 添加场景旋转
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', () => {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      mountRef.current.removeChild(rendererRef.current.domElement);
    };
  }, []);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const radius = 150; // 螺旋的半径
    let currentHeight = -300; // 初始化高度

    images.forEach((imgSrc, index) => {
      textureLoader.load(`${IMAGE_BASE_URL}/${imgSrc}`, texture => {
        const aspectRatio = texture.image.height / texture.image.width;
        const geometry = new THREE.PlaneGeometry(100 * aspectRatio, 100); // 调整图片的尺寸
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);

        const angle = index * 0.5; // 增加旋转间隔
        mesh.position.x = radius * Math.cos(angle);
        mesh.position.y = currentHeight; // 增加垂直间距
        mesh.position.z = radius * Math.sin(angle);
        currentHeight += 90; // 增加间距值

        mesh.lookAt(cameraRef.current.position); // 使图片始终面向相机

        sceneRef.current.add(mesh);
      });
    });
  }, [images]);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ModelViewer;
