import * as THREE from 'three';
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';
import BaseSketch from '../lib/base-sketch';

export default class Sketch extends BaseSketch {
  constructor(selector) {
    super(selector, true);

    this.addObjects();
    this.animate();
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 },
      },
      // wireframe: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    const geometry = new THREE.PlaneGeometry(1, 1, 64, 64);
    const plane = new THREE.Mesh(geometry, this.material);
    this.scene.add(plane);
  }

  animate() {
    this.time += 0.05;

    this.material.uniforms.time.value = this.time;

    this.render();
    requestAnimationFrame(this.animate.bind(this));
  }
}
