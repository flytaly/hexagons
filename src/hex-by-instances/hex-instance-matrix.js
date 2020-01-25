import { Object3D } from 'three';

export function setHexInstanceMatrix(instancedMesh, hexCount, widthStep, heightStep) {
  const dummy = new Object3D();
  let counter = 0;

  for (let i = 0; i < hexCount; i += 1) {
    for (let j = 0; j < hexCount; j += 1) {
      dummy.position.set(
        (i + (j % 2) * 0.5 - hexCount / 2) * widthStep, // shift only even rows
        (j + 0.5 - hexCount / 2) * heightStep,
        0,
      );

      dummy.updateMatrix();

      instancedMesh.setMatrixAt(counter++, dummy.matrix);
    }
  }
}
