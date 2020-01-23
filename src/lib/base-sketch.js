import * as THREE from 'three';
const OrbitControls = require('three-orbit-controls')(THREE);

export default class BaseSketch {
  constructor(selector, withOrbitControls = true) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer();

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerWidth);

    this.container = document.getElementById(selector);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);
    this.camera.position.set(0, 0, 3);
    this.camera.lookAt(0, 0, 0);

    if (withOrbitControls) {
      new OrbitControls(this.camera, this.renderer.domElement);
    }

    this.time = 0;

    this.setupResize();
    this.resize();
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.gui) {
      this.gui.destroy();
    }
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
