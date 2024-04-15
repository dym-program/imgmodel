import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { IMAGE_BASE_URL, API_BASE_URL } from '../../config';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ModelViewer = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene()); // 创建一个共享的场景引用
  const groupRef = useRef(new THREE.Group()); // 创建一个group引用，包含所有图片
  const [images, setImages] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const cameraRef = useRef();
  const rendererRef = useRef();

  useEffect(() => {
    // 初始化基本的 THREE.js 场景元素
    cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setClearColor(0x000000, 0); // 透明背景
    mountRef.current.appendChild(rendererRef.current.domElement);

    const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    cameraRef.current.position.z = 500; // 调整相机位置

    // 灯光设置
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    sceneRef.current.add(ambientLight);

    // 获取图片数据
    const loadImages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/images`);
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    loadImages();

    // 添加group到场景
    sceneRef.current.add(groupRef.current);

    // 渲染循环
    const animate = () => {
      if (!isHovering) {
        groupRef.current.rotation.y += 0.005; // 循环旋转group
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      requestAnimationFrame(animate);
    };

    animate();

    // 监听窗口大小变化以及清理工作
    const handleResize = () => {
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(rendererRef.current.domElement);
    };
  }, [isHovering]); // 添加isHovering作为依赖

  useEffect(() => {
    const scene = sceneRef.current;
    const group = groupRef.current;
    group.children.forEach(child => {
      scene.remove(child); // 移除旧的图片对象
    });
    const textureLoader = new THREE.TextureLoader();
    images.forEach((image, index) => {
      textureLoader.load(`${IMAGE_BASE_URL}/${image}`, texture => {
        const aspectRatio = texture.image.height / texture.image.width;
        const planeGeometry = new THREE.PlaneGeometry(texture.image.width, texture.image.height);
        const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

        const scaleRatio = 0.05; // 缩放因子
        planeMesh.scale.set(scaleRatio, scaleRatio, 1); // 应用缩放

        const angle = Math.PI * 2 * (index / images.length);
        const distance = 150; // 调整图片离中心的距离
        planeMesh.position.x = Math.cos(angle) * distance;
        planeMesh.position.y = Math.sin(angle) * distance;
        planeMesh.position.z = index * 0.5; // 轻微分离Z轴以避免渲染冲突

        planeMesh.lookAt(cameraRef.current.position); // 使图片面向相机

        group.add(planeMesh); // 将图片添加到组中
      });
    });

    // 添加鼠标悬停事件
    const raycaster = new THREE.Raycaster();
    const onMouseMove = (event) => {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(group.children);

      if (intersects.length > 0) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [images]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100vh' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    />
  );
};

export default ModelViewer;
