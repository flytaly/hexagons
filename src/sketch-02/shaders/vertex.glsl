uniform float time;
uniform vec2 u_resolution;
varying vec2 vUv;

void main() {
  vUv = uv  + .5;
  gl_Position = projectionMatrix * modelViewMatrix  * instanceMatrix * vec4(position, 1.0);
}
