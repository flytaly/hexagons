import * as THREE from 'three';
const OrbitControls = require('three-orbit-controls')(THREE);

export default class BaseSketch {
  constructor(selector, withOrbitControls = true) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      // antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.width = window.innerWidth;
    this.height = window.innerWidth;
    this.renderer.setSize(this.width, this.height);

    this.container = document.getElementById(selector);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 10000);
    this.camera.position.set(0, 0, 3);
    // this.camera.lookAt(0, 0, 0);

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
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    if (this.material && this.material.uniforms.u_resolution) {
      this.material.uniforms.u_resolution.value.x = this.width;
      this.material.uniforms.u_resolution.value.y = this.height;
    }
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
