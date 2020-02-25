import { HexGeometry } from '../hex-by-instances/hex-geometry';
import BaseSketch from '../lib/base-sketch';
import * as THREE from 'three';
import gsap from 'gsap';
import SimplexNoise from 'simplex-noise';

const toRad = Math.PI / 180;

export default class Sketch extends BaseSketch {
  constructor(selector) {
    super(selector, true);

    this.debug = true;

    this.init();
    this.hexagonGrid();
    this.floor();
    this.addLight();

    this.group.rotation.set(-60 * toRad, 0, 0);
    this.scene.add(this.group);
    this.animate();
  }

  init() {
    this.group = new THREE.Object3D();

    this.color = 0xffffff;
    this.hexCount = 6;
    this.hexSize = 5;
    this.widthStep = this.hexSize * Math.sqrt(3);
    this.heightStep = this.hexSize * 1.5; // 2 * size * 3/4

    this.camera.position.set(0, 0, 110);
    this.renderer.shadowMap.enabled = true;
    this.camera.fov = 45;
    this.camera.updateProjectionMatrix();
    this.renderer.setClearColor(this.color);

    if (this.debug) {
      const axesHelper = new THREE.AxesHelper(500);
      // this.scene.add(axesHelper);
    }
  }

  hexagonGrid() {
    this.hexagons = [];
    const geometry = new HexGeometry(this.hexSize);
    this.hexMaterial = new THREE.MeshLambertMaterial({
      color: 0xdddddd,
      side: THREE.DoubleSide,
    });
    let x = 0;
    let y = 0;
    const simplex = new SimplexNoise();
    for (let i = 0; i < this.hexCount; i += 1) {
      for (let j = 0; j < this.hexCount; j += 1) {
        x = (i + (j % 2) * 0.5 - this.hexCount / 2) * this.widthStep; // shift only even rows
        y = (j + 0.5 - this.hexCount / 2) * this.heightStep;

        const hexagon = new THREE.Mesh(geometry, this.hexMaterial);
        hexagon.position.set(x, y, 0);
        hexagon.castShadow = true;
        hexagon.receiveShadow = true;
        this.hexagons.push(hexagon);
        const noise = Math.abs(simplex.noise2D(i, j));
        gsap.to(hexagon.rotation, {
          ease: 'elastic.out(1,0.3)',
          repeat: -1,
          duration: 4 + Math.random() * 3,
          delay: noise * 10,
          x: Math.random < 0.5 ? -Math.PI : Math.PI,
          y: Math.random < 0.5 ? -Math.PI : Math.PI,
        });
      }
    }

    this.group.add(...this.hexagons);
  }

  floor() {
    const geometry = new THREE.PlaneBufferGeometry(this.hexSize * 20, this.hexSize * 20, this.hexSize);
    const material = new THREE.MeshLambertMaterial({
      color: this.color,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.position.z = -this.hexSize * 3;
    this.group.add(plane);
  }

  addLight() {
    // this.light = new THREE.DirectionalLight(this.color, 0.4);
    this.light = new THREE.PointLight(this.color, 1, 150);
    this.ambientLight = new THREE.AmbientLight(this.color, 0.2);

    this.light.castShadow = true;
    this.light.shadow.bias = -0.01;
    this.light.shadow.castShadow = true;

    this.light.position.set(-20, -20, 30);

    const d = 25;
    this.light.shadow.camera.near = 1;
    this.light.shadow.camera.far = 200;
    this.light.shadow.camera.left = -d;
    this.light.shadow.camera.right = d;
    this.light.shadow.camera.top = d;
    this.light.shadow.camera.bottom = -d;

    this.group.add(this.ambientLight).add(this.light);

    if (this.debug) {
      // this.group.add(new THREE.DirectionalLightHelper(this.light, 100, 'red'));
      this.group.add(new THREE.PointLightHelper(this.light, 100, 'blue'));
      this.group.add(new THREE.CameraHelper(this.light.shadow.camera));
    }
  }

  animate() {
    this.time += 0.05;

    // this.materialHex.uniforms.u_time.value = this.time;
    // this.hexagons[10].rotation.x = 10 * Math.sin(this.time / 30);
    this.render();
    this.rafId = requestAnimationFrame(this.animate.bind(this));
  }
}

new Sketch('container');
