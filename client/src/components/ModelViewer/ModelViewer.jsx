import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { IMAGE_BASE_URL, API_BASE_URL } from '../../config';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ModelViewer = () => {
  const mountRef = useRef(null);
  const scene = useRef(new THREE.Scene()).current;
  const camera = useRef(new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000)).current;
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true, alpha: true })).current;
  const [images, setImages] = useState([]);
  const imageGroup = useRef(new THREE.Group());
  const activeMeshes = useRef([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const lastRenderTime = useRef(Date.now());

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

    const loadImages = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/images`);
        setImages(response.data || []);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
      setIsLoading(false);
    };

    loadImages(); // Only called once on component mount

    const animate = () => {
      const now = Date.now();
      if (now - lastRenderTime.current > 50) { // Control the update rate to 20 fps
        updateImages();
        lastRenderTime.current = now;
      }
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      imageGroup.current.rotation.y += 0.001;
    };

    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const updateImages = () => {
    const moveStep = 0.4; // Adjust movement speed
    activeMeshes.current.forEach(mesh => {
      mesh.position.y += moveStep;
      mesh.lookAt(camera.position);
    });

    while (activeMeshes.current.length && activeMeshes.current[0].position.y > window.innerHeight / 2) {
      const meshToRemove = activeMeshes.current.shift();
      imageGroup.current.remove(meshToRemove);
    }

    if (activeMeshes.current.length < 10 && !isLoading && images.length > 10) {
      const neededImages = 10 - activeMeshes.current.length;
      const startPositionY = activeMeshes.current.length > 0 ? activeMeshes.current[activeMeshes.current.length - 1].position.y + 100 : -300;
      addImagesToScene(neededImages, startPositionY);
    }
  };

  const addImagesToScene = (count, startHeight) => {
    if (!images.length || isLoading) return;
    setIsLoading(true);
    const textureLoader = new THREE.TextureLoader();
    const radius = 350;
    let currentHeight = startHeight;

    for (let i = 0; i < count; i++) {
      const imgIndex = (currentImageIndex + i) % images.length;
      const imgSrc = images[imgIndex];
      textureLoader.load(`${IMAGE_BASE_URL}/${imgSrc}`, texture => {
        const aspectRatio = texture.image.height / texture.image.width;
        const geometry = new THREE.PlaneGeometry(100 * aspectRatio, 100);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);

        const angle = (currentImageIndex + i) * 0.4;
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
