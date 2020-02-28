import { HexGeometry } from '../hex-by-instances/hex-geometry';
import { BoundGeometry } from './bound-geometry';
import BaseSketch from '../lib/base-sketch';
import * as THREE from 'three';
import gsap from 'gsap';
import SimplexNoise from 'simplex-noise';

const toRad = Math.PI / 180;

export default class Sketch extends BaseSketch {
  constructor(selector) {
    super(selector, true);

    this.debug = false;

    this.init();

    this.boundGeometry = {};
    this.hexagonGrid();
    this.floor();
    this.addObjects();
    this.addLight();
    this.mouseMove();

    // this.group.rotation.set(-60 * toRad, 0, 0);
    this.scene.add(this.group);

    this.animate();
  }

  init() {
    this.time = 0;
    this.group = new THREE.Object3D();

    this.color = 0xffffff;
    // this.color2 = 0x000000;
    this.color2 = 0x3b9fa6;
    this.hexCount = 7; // number of hexagons in the middle row/column. Should be odd number!
    this.hexSize = 5;
    this.widthStep = this.hexSize * Math.sqrt(3);
    this.heightStep = this.hexSize * 1.5; // 2 * size * 3/4
    this.floorSize = this.hexSize * this.hexCount * 10;

    // this.camera.position.set(0, 0, 100);
    // this.camera.position.set(-7, -70, 90);
    this.camera.position.set(0, -77, 44);

    this.camera.lookAt(0, 5, 5);

    this.renderer.shadowMap.enabled = true;
    this.camera.fov = 45;
    this.camera.updateProjectionMatrix();
    this.renderer.setClearColor(this.color);

    if (this.debug) {
      const axesHelper = new THREE.AxesHelper(500);
      // this.scene.add(axesHelper);
    }
  }
  addObjects() {
    const geometry = new THREE.OctahedronBufferGeometry(5);
    const material = new THREE.MeshPhongMaterial({
      color: this.color,
    });
    this.octahedron = new THREE.Mesh(geometry, material);
    this.octahedron.receiveShadow = true;
    this.octahedron.castShadow = true;
    this.octahedron.position.z = 20;
    this.group.add(this.octahedron);
  }

  hexagonGrid() {
    this.hexagons = [];
    this.hexGeometry = new HexGeometry(this.hexSize);
    this.hexMaterial = new THREE.MeshPhongMaterial({
      color: 0xdddddd,
      side: THREE.DoubleSide,
    });
    const { vertexCoords } = this.hexGeometry;

    let x = 0;
    let y = 0;
    const simplex = new SimplexNoise();
    let middle = Math.floor(this.hexCount / 2);
    for (let r = -middle; r <= middle; r += 1) {
      for (let q = -middle; q <= middle; q += 1) {
        const odd = Math.abs(r) % 2;
        const len = (this.hexCount - Math.abs(r)) / 2;
        if (Math.abs(q) >= len + odd) continue;
        if (odd && q === -len) continue;

        x = (q + (1 - odd) * 0.5) * this.widthStep;
        y = r * this.heightStep;

        const hexagon = new THREE.Mesh(this.hexGeometry, this.hexMaterial);
        hexagon.position.set(x, y, 0);

        hexagon.castShadow = true;
        hexagon.receiveShadow = true;
        this.hexagons.push(hexagon);

        if (!this.boundGeometry.bottom && r === -middle) {
          this.boundGeometry.bottom = new BoundGeometry({
            x,
            y,
            hexPoints: vertexCoords,
            hexesInRow: len * 2,
            hexesInCol: this.hexCount,
            hexSize: this.hexSize,
            planeSize: this.floorSize,
          });
        }

        const noise = Math.abs(simplex.noise2D(r, q));

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
    // const boundMaterial = new THREE.MeshLambertMaterial({
    // Mesh Lambert doesn't work properly for some reasons
    const boundMaterial = new THREE.MeshPhongMaterial({
      // wireframe: true,
      // color: 0xff0000,
      flatShading: true,
      color: this.color,
      side: THREE.BackSide,
    });
    const mesh = new THREE.Mesh(this.boundGeometry.bottom, boundMaterial);
    mesh.receiveShadow = true;
    this.group.add(mesh);
    const geometry = new THREE.PlaneBufferGeometry(this.floorSize, this.floorSize, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x3b9fa6,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.z = -this.hexSize * 3;
    this.group.add(plane);
  }

  addLight() {
    // this.light = new THREE.DirectionalLight(this.color, 1.4);
    // this.light = new THREE.SpotLight(this.color, 1.4, 200);
    this.light = new THREE.PointLight(this.color1, 1.4, 200);
    this.light2 = new THREE.PointLight(this.color2, 3);
    this.ambientLight = new THREE.AmbientLight(this.color1, 0);

    this.light.castShadow = true;
    this.light.shadow.bias = -0.005;
    this.light2.castShadow = true;
    this.light2.shadow.bias = -0.005;

    this.lightStartPosition = new THREE.Vector3(-10, 5, 30);
    this.light.position.copy(this.lightStartPosition);
    this.light2.position.copy(new THREE.Vector3(0, 0, -10));

    const d = 25;
    this.light.shadow.camera.near = 1;
    this.light.shadow.camera.far = 200;
    this.light.shadow.camera.left = -d;
    this.light.shadow.camera.right = d;
    this.light.shadow.camera.top = d;
    this.light.shadow.camera.bottom = -d;

    this.group
      .add(this.ambientLight)
      .add(this.light)
      .add(this.light2);

    if (this.debug) {
      // this.group.add(new THREE.DirectionalLightHelper(this.light, 100, 'red'));
      this.group.add(new THREE.PointLightHelper(this.light, 100, 'red'));
      this.group.add(new THREE.PointLightHelper(this.light2, 100, 'yellow'));
      this.group.add(new THREE.CameraHelper(this.light.shadow.camera));
    }
  }

  mouseMove() {
    this.mouseScreen = new THREE.Vector3(0, 0, 0);
    this.raycaster = new THREE.Raycaster();

    const geometry = new THREE.PlaneBufferGeometry(this.floorSize, this.floorSize, 1);
    const material = new THREE.MeshBasicMaterial({
      // color: 'green',
      // opacity: 0.2,
      opacity: 0,
      transparent: true,
      // side: THREE.DoubleSide,
    });

    const lightPlaneMesh = new THREE.Mesh(geometry, material);
    lightPlaneMesh.position.z = 1;
    this.group.add(lightPlaneMesh);

    this.mouseMoveHandler = (event) => {
      this.mouseScreen.x = (event.clientX / this.width) * 2 - 1;
      this.mouseScreen.y = -(event.clientY / this.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouseScreen, this.camera);
      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects([lightPlaneMesh]);
      if (intersects.length > 0) {
        this.light.position.x = intersects[0].point.x;
        this.light.position.y = intersects[0].point.y;
      }
    };

    this.renderer.domElement.addEventListener('mousemove', this.mouseMoveHandler, false);
  }

  animate() {
    this.time = this.time + 0.05;
    this.octahedron.rotation.z = this.time / 10;
    // this.octahedron.rotateOnAxis([1, 0, 0], 0.01);
    this.render();
    this.rafId = requestAnimationFrame(this.animate.bind(this));
  }
}

new Sketch('container');
