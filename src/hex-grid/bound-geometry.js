import { BufferGeometry, BufferAttribute, Matrix4, Vector3, BufferGeometryUtils } from 'three';

export class BoundGeometry extends BufferGeometry {
  constructor({ x, y, hexPoints, hexesInRow, hexesInCol, hexSize, planeSize }) {
    super();
    this.hexSize = hexSize;
    this.widthStep = this.hexSize * Math.sqrt(3);
    this.heightStep = this.hexSize * 1.5;
    this.planeSize = planeSize;
    this.hexesInRow = hexesInRow;
    this.hexesInCol = hexesInCol;
    this.offsetWidth = (this.planeSize - this.hexesInRow * this.widthStep) / 2;
    this.offsetHeight = (this.planeSize - this.hexesInCol * this.heightStep) / 2;
    this.x = x;
    this.y = y;
    this.p = hexPoints;
    this.vertices = [];
    this.generateGeometry();
  }

  LeftBot() {
    const { p, x, y, offsetWidth } = this;
    const halfHeight = this.hexesInCol / 2;
    for (let i = 0; i < halfHeight; i += 1) {
      const h = i * this.heightStep;
      const w = (i * this.widthStep) / 2;
      this.vertices.push(
        this.leftBotCoords[0],
        this.leftBotCoords[1] + h,
        0,
        p[5][0] + x - offsetWidth,
        p[5][1] + y + h,
        0,
        p[0][0] + x - w,
        p[0][1] + y + h,
        0,
      );
      this.vertices.push(
        p[5][0] + x - offsetWidth,
        p[5][1] + y + h,
        0,
        p[5][0] + x - w,
        p[5][1] + y + h,
        0,
        p[0][0] + x - w,
        p[0][1] + y + h,
        0,
      );
      this.vertices.push(
        p[5][0] + x - offsetWidth,
        p[5][1] + y + h,
        0,
        p[4][0] + x - w,
        p[4][1] + y + h,
        0,
        p[5][0] + x - w,
        p[5][1] + y + h,
        0,
      );
      this.vertices.push(
        p[5][0] + x - offsetWidth,
        p[5][1] + y + h,
        0,
        this.leftBotCoords[0],
        this.leftBotCoords[1] + h + this.heightStep,
        0,
        p[4][0] + x - w,
        p[4][1] + y + h,
        0,
      );
    }
  }

  LeftTop() {
    const { p, x, y } = this;
    const halfHeight = Math.round(this.hexesInCol / 2);

    for (let i = 0; i < halfHeight; i += 1) {
      const h = (halfHeight + i) * this.heightStep;
      const w = ((halfHeight - i) * this.widthStep) / 2;
      this.vertices.push(
        this.leftBotCoords[0],
        this.leftBotCoords[1] + h,
        0,
        p[1][0] + x - w,
        p[1][1] + y + h,
        0,
        p[0][0] + x - w,
        p[0][1] + y + h,
        0,
      );
      this.vertices.push(
        this.leftBotCoords[0],
        this.leftBotCoords[1] + h,
        0,
        this.leftBotCoords[0],
        p[1][1] + y + h,
        0,
        p[1][0] + x - w,
        p[1][1] + y + h,
        0,
      );
      if (i < halfHeight - 1) {
        this.vertices.push(
          this.leftBotCoords[0],
          p[1][1] + y + h,
          0,
          p[2][0] + x - w,
          p[2][1] + y + h,
          0,
          p[1][0] + x - w,
          p[1][1] + y + h,
          0,
        );
        this.vertices.push(
          this.leftBotCoords[0],
          p[1][1] + y + h,
          0,
          this.leftBotCoords[0],
          p[2][1] + y + h,
          0,
          p[2][0] + x - w,
          p[2][1] + y + h,
          0,
        );
      }
    }
  }

  generateBottomBound() {
    const { p, x, y, offsetWidth, widthStep, hexesInRow } = this;
    const [x0, y0] = this.leftBotCoords;
    const x1 = p[0][0] + x + hexesInRow * widthStep + offsetWidth - widthStep / 2;
    const y1 = p[0][1] + y;
    this.vertices.push(x1, y1 - this.offsetHeight, 0, x0, y0, 0, x1, y1, 0);
    this.vertices.push(x0, y0 - this.offsetHeight, 0, x0, y0, 0, x1, y1 - this.offsetHeight, 0);
  }

  generateGeometry() {
    const { p, x, y, widthStep, offsetWidth } = this;
    for (let i = 0; i < this.hexesInRow - 1; i += 1) {
      this.vertices.push(
        p[0][0] + x + i * widthStep,
        p[0][1] + y,
        0,
        p[1][0] + x + i * widthStep,
        p[1][1] + y,
        0,
        p[0][0] + x + i * widthStep + widthStep,
        p[0][1] + y,
        0,
      );
    }
    this.leftBotCoords = [p[0][0] + x - offsetWidth - widthStep / 2, p[0][1] + y];
    this.generateBottomBound();
    this.LeftBot();
    this.LeftTop();
    this.setAttribute('position', new BufferAttribute(new Float32Array(this.vertices), 3));

    const topRightGeometry = this.clone();
    topRightGeometry.rotateZ(Math.PI);
    topRightGeometry.translate(this.widthStep, 0, 0);
    const vertices2 = topRightGeometry.attributes.position.array;

    const combinePositions = new Float32Array(this.vertices.length + vertices2.length);
    combinePositions.set(this.vertices);
    combinePositions.set(vertices2, this.vertices.length);

    this.setAttribute('position', new BufferAttribute(new Float32Array(combinePositions), 3));

    const normals = [];
    for (let i = 0; i < this.vertices.length + vertices2.length; i = i + 3) {
      normals.push(0, 0, -1);
    }
    this.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
  }
}
