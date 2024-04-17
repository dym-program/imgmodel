import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { IMAGE_BASE_URL, API_BASE_URL } from '../../config';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ModelViewer = () => {
  const mountRef = useRef(null);
  const scene = useRef(new THREE.Scene()).current;
  const camera = useRef(new THREE.OrthographicCamera(
    window.innerWidth / -2, 
    window.innerWidth / 2, 
    window.innerHeight / 2, 
    window.innerHeight / -2, 
    1, 
    1000
  )).current;
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true, alpha: true })).current;
  const [images, setImages] = useState([]);
  const imageGroup = useRef(new THREE.Group());
  const activeMeshes = useRef([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    console.log("Component mounted");

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    new OrbitControls(camera, renderer.domElement);
    camera.position.z = 500;
    scene.add(imageGroup.current);

    window.addEventListener('resize', () => {
      camera.left = window.innerWidth / -2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = window.innerHeight / -2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const loadImages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/images`);
        if (response.data) {
          console.log("Images loaded:", response.data); // 确认加载到的数据
          setImages(response.data);
        } else {
          console.error("No data received from images endpoint");
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    loadImages();

    const animate = () => {
      requestAnimationFrame(animate);
      updateImages();
      renderer.render(scene, camera);
      imageGroup.current.rotation.y += 0.005;
    };

    animate();

    return () => {
      console.log("Component unmounted");
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    console.log('Images updated, new length:', images.length);
    if (images.length > 0) {
      addImagesToScene(10, -300); // 只有当有图片时才尝试加载场景中的图片
    }
  }, [images]); // 监听 images 的变化

  const addImagesToScene = (count, startHeight) => {
    if (!images.length) {
        console.log("No images available to load");
        return; // 如果没有图片，直接返回
    }
    const textureLoader = new THREE.TextureLoader();
    const radius = 300;
    let currentHeight = startHeight;

    for (let i = 0; i < count; i++) {
        const imgIndex = (currentImageIndex + i) % images.length;
        const imgSrc = images[imgIndex];
        textureLoader.load(`${IMAGE_BASE_URL}/${imgSrc}`, texture => {
            const aspectRatio = texture.image.height / texture.image.width;
            const geometry = new THREE.PlaneGeometry(100 * aspectRatio, 100);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);

            const angle = (currentImageIndex + i) * 0.5;
            mesh.position.set(radius * Math.cos(angle), currentHeight, radius * Math.sin(angle));
            currentHeight += 90;

            imageGroup.current.add(mesh);
            activeMeshes.current.push(mesh);
        });
    }

    setCurrentImageIndex(prev => (prev + count) % images.length);
};


  const updateImages = () => {
    const moveStep = 2; // 图片每帧移动的步长
    activeMeshes.current.forEach(mesh => {
      mesh.position.y += moveStep; // 向上移动图片
      mesh.lookAt(camera.position); // 确保图片始终面向相机
    });
  
    // 检查并移除超出视界的图片
    if (activeMeshes.current.length > 0 && activeMeshes.current[activeMeshes.current.length - 1].position.y > window.innerHeight / 2) {
      const meshToRemove = activeMeshes.current.pop(); // 移除数组中的最后一个元素，即最顶部的元素
      imageGroup.current.remove(meshToRemove); // 从场景中移除该元素
    }
  
    // 如果当前激活的图片少于10张，并且有足够的图片可以加载，则继续加载新图片
    if (activeMeshes.current.length < 10) {
      const neededImages = 10 - activeMeshes.current.length; // 计算需要加载的图片数量
      const nextImageIndex = (currentImageIndex + activeMeshes.current.length) % images.length; // 计算下一个图片的索引
      const startPositionY = activeMeshes.current.length > 0 ? activeMeshes.current[activeMeshes.current.length - 1].position.y + 90 : -300; // 计算新图片的起始位置
      addImagesToScene(neededImages, startPositionY);
    }
  };
  
  

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ModelViewer;
