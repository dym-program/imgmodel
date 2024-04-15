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
  const loadedMeshes = useRef([]);
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
    const textureLoader = new THREE.TextureLoader();
    const radius = 300;
    let currentHeight = -300;

    images.slice(0, 10).forEach((imgSrc, index) => {
      textureLoader.load(`${IMAGE_BASE_URL}/${imgSrc}`, texture => {
        const aspectRatio = texture.image.height / texture.image.width;
        const geometry = new THREE.PlaneGeometry(100 * aspectRatio, 100);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);

        const angle = index * 0.5;
        mesh.position.set(radius * Math.cos(angle), currentHeight, radius * Math.sin(angle));
        currentHeight += 90;

        // 创建点光源，添加光晕效果
        const light = new THREE.PointLight(0xfffeee, 1.5, 150);
        light.color.setHSL(Math.random(), 1, 0.5);  // 随机颜色
        light.position.copy(mesh.position);
        scene.add(light);
        loadedMeshes.current.push(mesh);
        imageGroup.current.add(mesh);
      });
    });
  }, [images]);

  const updateImages = () => {
    loadedMeshes.current.forEach(mesh => {
      mesh.lookAt(camera.position);
    });
  };

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ModelViewer;
