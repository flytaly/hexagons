import * as THREE from 'three';
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';
import BaseSketch from '../lib/base-sketch';
import img from '../img/bg1.jpg';

export default class Sketch extends BaseSketch {
  constructor(selector) {
    super(selector, true);

    document.body.style.backgroundColor = '#444444';
    document.body.style.backgroundImage = `url(${img})`;
    document.body.style.backgroundSize = `cover`;

    this.raycaster = new THREE.Raycaster();
    this.mouse = { x: 0, y: 0 };
    this.mouseMove();

    this.addObjects();
    this.animate();
    this.resize();
  }

  stop() {
    document.body.style.backgroundColor = '';
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    super.stop();
  }

  mouseMove() {
    this.testPlane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial());
    window.addEventListener(
      'mousemove',
      () => {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects([this.testPlane]);

        if (intersects.length > 0) {
          this.material.uniforms.u_mouse.value = intersects[0].point;
        }
      },
      false,
    );
  }

  resize() {
    // set plane fullscreen
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    if (this.plane) {
      let dist = this.camera.position.z - this.plane.position.z;
      let height = 0.9;
      this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));
      this.plane.scale.x = this.width / this.height;
    }

    if (this.material && this.material.uniforms.u_resolution) {
      this.material.uniforms.u_resolution.value.x = this.width;
      this.material.uniforms.u_resolution.value.y = this.height;
    }

    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        u_time: { type: 'f', value: 0 },
        u_resolution: { type: 'v2', value: new THREE.Vector2(this.width, this.height) },
        u_mouse: { type: 'f', value: new THREE.Vector3() },
      },
      // wireframe: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.plane = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.plane);
  }

  animate() {
    this.time += 0.05;
    this.scene.rotation.x = -this.mouse.x / 15;
    this.scene.rotation.y = this.mouse.y / 15;

    this.material.uniforms.u_time.value = this.time;

    this.render();
    requestAnimationFrame(this.animate.bind(this));
  }
}
