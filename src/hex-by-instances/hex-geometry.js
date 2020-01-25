import { BufferGeometry, BufferAttribute } from 'three';

export class HexGeometry extends BufferGeometry {
  constructor(hexSize = 1, center = { x: 0, y: 0 }) {
    super();
    this.hexSize = hexSize;
    this.center = center;
    this.generateGeometry();
  }

  generateGeometry() {
    const vertices = [];
    let prevX, prevY;
    [prevX, prevY] = this.pointyHexCorner(5);
    for (let j = 0; j < 6; j += 1) {
      const [x, y] = this.pointyHexCorner(j);
      vertices.push(x, y, 0);
      vertices.push(this.center.x, this.center.y, 0);
      vertices.push(prevX, prevY, 0);
      prevX = x;
      prevY = y;
    }
    const uvs = [];
    for (let i = 0; i < vertices.length; i = i + 3) {
      uvs.push(vertices[i] / this.hexSize, vertices[i + 1] / this.hexSize);
    }
    this.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    this.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  }

  pointyHexCorner(i) {
    // const angleDeg = 60 * i - 30°;
    const angleRad = (Math.PI / 3) * (i - 1 / 2);
    return [
      this.center.x + this.hexSize * Math.cos(angleRad), //
      this.center.y + this.hexSize * Math.sin(angleRad),
    ];
  }
}
