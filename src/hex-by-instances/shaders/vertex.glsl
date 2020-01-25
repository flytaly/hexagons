uniform float u_time;
uniform float u_scale;
uniform vec2 u_resolution;
varying vec2 vUv;

varying vec2 worldUv;

void main() {
  vUv = uv;

  vec3 p = position;

  p.z += 0.1*(abs(sin(instanceMatrix[3].x + u_time*0.1)));

  vec4 mvPosition = instanceMatrix * vec4(p, 1.0);

  worldUv = mvPosition.xy / (u_scale * 1.1) + 0.5;

	gl_Position = projectionMatrix * modelViewMatrix * mvPosition;
}
