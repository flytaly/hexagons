import { BufferGeometry, BufferAttribute } from 'three';

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

  generateLeftBound() {
    const { p, x, y, offsetWidth, widthStep } = this;
    //left offset
    this.vertices.push(
      p[5][0] + x - offsetWidth, //
      p[5][1] + y,
      0,
      p[5][0] + x,
      p[5][1] + y,
      0,
      p[0][0] + x,
      p[0][1] + y,
      0,
    );
    this.leftCoords = [p[0][0] + x - offsetWidth - widthStep / 2, p[0][1] + y];
    this.vertices.push(
      this.leftCoords[0], //
      this.leftCoords[1],
      0,
      p[5][0] + x - offsetWidth,
      p[5][1] + y,
      0,
      p[0][0] + x,
      p[0][1] + y,
      0,
    );
  }
  generateRightBound() {
    const { p, x, y, offsetWidth, widthStep, hexesInRow: hexesInLine } = this;
    const shiftX = (hexesInLine - 1) * widthStep;
    this.vertices.push(
      p[0][0] + x + shiftX,
      p[0][1] + y,
      0,
      p[1][0] + x + shiftX,
      p[1][1] + y,
      0,
      p[1][0] + x + shiftX + offsetWidth,
      p[1][1] + y,
      0,
    );
    this.rightCoords = [p[0][0] + x + shiftX + offsetWidth + widthStep / 2, p[0][1] + y];
    this.vertices.push(
      p[0][0] + x + shiftX,
      p[0][1] + y,
      0,
      p[1][0] + x + shiftX + offsetWidth,
      p[1][1] + y,
      0,
      this.rightCoords[0],
      this.rightCoords[1],
      0,
    );
  }
  generateBottomBound() {
    const [x0, y0] = this.leftCoords;
    const [x1, y1] = this.rightCoords;
    this.vertices.push(x0, y0, 0, x1, y1, 0, x1, y1 - this.offsetHeight, 0);
    this.vertices.push(x0, y0 - this.offsetHeight, 0, x0, y0, 0, x1, y1 - this.offsetHeight, 0);
  }
  generateGeometry() {
    const { p, x, y, widthStep } = this;
    this.generateLeftBound();
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
    this.generateRightBound();
    this.generateBottomBound();
    const normals = [];
    for (let i = 0; i < this.vertices.length; i = i + 3) {
      normals.push(0, 0, -1);
    }
    this.setAttribute('position', new BufferAttribute(new Float32Array(this.vertices), 3));
    this.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
  }
}
