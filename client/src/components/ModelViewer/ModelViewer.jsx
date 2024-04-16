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
        setImages(response.data);
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
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      loadInitialImages();
    }
  }, [images]);

  const loadInitialImages = () => {
    addImagesToScene(10, -300); // Load first 10 images
  };

  const addImagesToScene = (count, startHeight) => {
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

    setCurrentImageIndex(prev => (prev + count) % images.length); // Update index to load new images next time
  };

  const updateImages = () => {
    const moveStep = 2;
    activeMeshes.current.forEach(mesh => {
      mesh.position.y += moveStep;
      mesh.lookAt(camera.position);
    });

    // Remove meshes that have moved too far
    while (activeMeshes.current.length && activeMeshes.current[0].position.y > 500) {
      const meshToRemove = activeMeshes.current.shift();
      imageGroup.current.remove(meshToRemove);
    }

    // Load new images if needed
    if (activeMeshes.current.length < 10 && images.length > 10) {
      const nextImageIndex = activeMeshes.current.length;
      addImagesToScene(1, -300); // Always add at the starting height
    }
  };

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ModelViewer;
