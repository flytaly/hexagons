import * as THREE from 'three';
import BaseSketch from '../lib/base-sketch';
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';

function pointyHexCorner(center, size, i) {
  // const angleDeg = 60 * i - 30°;
  const angleRad = (Math.PI / 3) * (i - 1 / 2);
  return [center.x + size * Math.cos(angleRad), center.y + size * Math.sin(angleRad)];
}

export default class Sketch extends BaseSketch {
  constructor(selector) {
    super(selector, true);

    this.hexSize = 0.1; // one hexagon's size

    this.widthStep = this.hexSize * Math.sqrt(3);
    this.heightStep = this.hexSize * 1.5; // 2 * size * 3/4

    this.hexCount = 35; // total = hexCount x hexCount
    // Adjust hex count depending of width. width = 1000px is a default value.
    this.hexCount = Math.round((this.hexCount * this.width) / 1000);

    this.addObjects();
    this.animate();
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);

    const aspect = this.width / this.height;
    this.camera.aspect = aspect;

    if (this.hexagons) {
      let dist = this.camera.position.z - this.hexagons.position.z;
      let height = 1;
      this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));

      // -1 since rows are shifted, heightStep is smaller than widthStep
      const scale = (this.hexCount - 1) * this.heightStep;

      this.hexagons.scale.x = aspect < 1 ? 1 / scale : aspect / scale;
      this.hexagons.scale.y = aspect < 1 ? 1 / scale : aspect / scale;
    }

    if (this.material && this.material.uniforms.u_resolution) {
      this.material.uniforms.u_resolution.value.x = this.width;
      this.material.uniforms.u_resolution.value.y = this.height;
    }

    this.camera.updateProjectionMatrix();
  }

  generateGeometry() {
    const geometry = new THREE.BufferGeometry();

    const vertices = [];

    let prevX, prevY;
    const center = { x: 0, y: 0 };
    [prevX, prevY] = pointyHexCorner(center, this.hexSize, 5);
    for (let j = 0; j < 6; j += 1) {
      const [x, y] = pointyHexCorner(center, this.hexSize, j);
      vertices.push(prevX, prevY, 0);
      vertices.push(x, y, 0);
      vertices.push(center.x, center.y, 0);
      prevX = x;
      prevY = y;
    }

    const uvs = [];
    for (let i = 0; i < vertices.length; i = i + 3) {
      uvs.push(vertices[i] / this.hexSize, vertices[i + 1] / this.hexSize);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));

    return geometry;
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        u_time: { type: 'f', value: 0 },
        u_resolution: { type: 'v2', value: new THREE.Vector2(this.width, this.height) },
      },
      // wireframe: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    const geometry = this.generateGeometry();
    this.hexagons = new THREE.InstancedMesh(geometry, this.material, this.hexCount ** 2);

    const hexGrid = new THREE.Object3D();
    let counter = 0;
    for (let i = 0; i < this.hexCount; i += 1) {
      for (let j = 0; j < this.hexCount; j += 1) {
        hexGrid.position.set(
          (i + (j % 2) * 0.5 - this.hexCount / 2) * this.widthStep, // shift only even rows
          (j + 0.5 - this.hexCount / 2) * this.heightStep,
          0,
        );

        hexGrid.updateMatrix();

        this.hexagons.setMatrixAt(counter++, hexGrid.matrix);
      }
    }
    this.scene.add(this.hexagons);
  }

  animate() {
    this.time += 0.05;

    this.render();
    requestAnimationFrame(this.animate.bind(this));
  }
}
