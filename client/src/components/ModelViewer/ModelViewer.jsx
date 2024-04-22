import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { IMAGE_BASE_URL, API_BASE_URL } from '../../config';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ModelViewer = () => {
  const lastUpdateTime = useRef(Date.now());
  const mountRef = useRef(null);
  const scene = useRef(new THREE.Scene()).current;
  const camera = useRef(new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000)).current;
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true, alpha: true })).current;
  const [images, setImages] = useState([]);
  const imageGroup = useRef(new THREE.Group());
  const activeMeshes = useRef([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/images`);
      setImages(response.data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadImages(); // Load images once on component mount
  }, [loadImages]);

  const updateImages = useCallback(() => {
    const now = Date.now();
    const updateInterval = 2000; // 增加更新间隔
    const moveStep = 0.05; // Adjust the speed of animation
    if (now - lastUpdateTime.current > updateInterval) {
      activeMeshes.current.forEach(mesh => {
        mesh.position.y += moveStep;
        mesh.lookAt(camera.position);
      });

      lastUpdateTime.current = now;
    }
    

    if (activeMeshes.current.length > 0  && activeMeshes.current[activeMeshes.current.length - 1].position.y > window.innerHeight / 2){
      const meshToRemove = activeMeshes.current.shift();
      imageGroup.current.remove(meshToRemove);
    }

    if (activeMeshes.current.length < 10 && !isLoading && images.length > 10) {
      const neededImages = 10 - activeMeshes.current.length;
      const startPositionY = activeMeshes.current.length > 0 ? activeMeshes.current[activeMeshes.current.length - 1].position.y + 100 : -300;
      addImagesToScene(neededImages, startPositionY);
    }
  }, [images, currentImageIndex, isLoading]);

  useEffect(() => {
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

    const animate = () => {
      requestAnimationFrame(animate);
      updateImages();
      renderer.render(scene, camera);
      imageGroup.current.rotation.y += 0.005;
    };

    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [updateImages]);

  const addImagesToScene = (count, startHeight) => {
    if (!images.length) {
      console.log("No images available to load");
      return;
    }
    setIsLoading(true);
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
        currentHeight += 100;

        imageGroup.current.add(mesh);
        activeMeshes.current.push(mesh);
      });
    }

    setIsLoading(false);
    setCurrentImageIndex(prev => (prev + count) % images.length);
  };

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ModelViewer;
