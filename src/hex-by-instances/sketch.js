import 'babel-polyfill';
import {
  DoubleSide,
  InstancedMesh,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  ShaderMaterial,
  TextureLoader,
  Vector2,
} from 'three';
import BaseSketch from '../lib/base-sketch';
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';
import img from '../img/bg3.jpg';
import { HexGeometry } from './hex-geometry';
import { setHexInstanceMatrix } from './hex-instance-matrix';

const LoadTexture = (url) =>
  new Promise((resolve) => {
    new TextureLoader().load(url, (data) => resolve(data));
  });

export default class Sketch extends BaseSketch {
  constructor(selector) {
    super(selector, true);
    this.init();
  }

  async init() {
    this.hexSize = 0.1; // one hexagon's size

    this.widthStep = this.hexSize * Math.sqrt(3);
    this.heightStep = this.hexSize * 1.5; // 2 * size * 3/4

    this.hexCount = 30; // total = hexCount x hexCount
    // Adjust hex count depending of width. width = 1000px is a default value.
    this.hexCount = Math.round((this.hexCount * this.width) / 1000);

    this.texture = await LoadTexture(img);
    this.texture.minFilter = LinearFilter;
    this.texture.magFilter = LinearFilter;

    this.addBgPlane();
    this.addHexagons();

    this.resize();
    this.animate();
  }

  addBgPlane() {
    this.materialPlane = new MeshBasicMaterial({ map: this.texture });
    const geometry = new PlaneBufferGeometry(this.widthStep * (this.hexCount - 1.7), this.heightStep * this.hexCount, 1, 1);
    this.plane = new Mesh(geometry, this.materialPlane);
    this.plane.position.z = -0.01;
    this.scene.add(this.plane);
  }

  addHexagons() {
    this.materialHex = new ShaderMaterial({
      side: DoubleSide,
      transparent: true,
      uniforms: {
        u_time: { type: 'f', value: 0 },
        u_resolution: { type: 'v2', value: new Vector2(this.width, this.height) },
        u_texture: { type: 't', value: this.texture },
        u_scale: { type: 'f', value: 1 },
      },
      // wireframe: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    const geometry = new HexGeometry(this.hexSize);
    geometry.computeTangents();
    this.hexagons = new InstancedMesh(geometry, this.materialHex, this.hexCount ** 2);
    setHexInstanceMatrix(this.hexagons, this.hexCount, this.widthStep, this.heightStep);

    this.scene.add(this.hexagons);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);

    const aspect = this.width / this.height;
    this.camera.aspect = aspect;

    if (this.hexagons && this.plane) {
      let dist = this.camera.position.z - this.plane.position.z;
      let height = 0.8;
      this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));

      // -1 since rows are shifted, heightStep is smaller than widthStep
      const scale = (this.hexCount - 1) * this.heightStep;
      const aspectScale = aspect < 1 ? 1 / scale : aspect / scale;
      this.hexagons.scale.set(aspectScale, aspectScale, 1);
      this.plane.scale.set(aspectScale, aspectScale, 1);
      this.materialHex.uniforms.u_scale.value = scale;
    }

    if (this.materialHex && this.materialHex.uniforms.u_resolution) {
      this.materialHex.uniforms.u_resolution.value.x = this.width;
      this.materialHex.uniforms.u_resolution.value.y = this.height;
    }

    this.camera.updateProjectionMatrix();
  }

  animate() {
    this.time += 0.05;
    this.materialHex.uniforms.u_time.value = this.time;
    this.render();
    requestAnimationFrame(this.animate.bind(this));
  }
}
