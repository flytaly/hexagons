#define PI 3.1415926
#define TWO_PI 6.2831852

uniform float u_time;
uniform float u_scale;
uniform vec2 u_resolution;

varying vec2 vUv;
varying vec2 vTextureUv;
varying vec3 worldNormal;
varying vec3 viewDirection;

float sqr3 = sqrt(3.);

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

void main() {
  vUv = uv;

  vec3 p = position;


  float t = u_time*0.5;
  float angle = PI/4. * cos(t);
  mat4 rmat = rotationMatrix(vec3(0., 1., 0.), angle);
  p = (rmat * vec4(p, 1.)).xyz;

  // p.z += 0.1*(abs(sin(instanceMatrix[3].x + u_time*0.1)));

  vec4 mvPosition = instanceMatrix * vec4(p, 1.0);


  vTextureUv = mvPosition.xy / (u_scale * 1.05) + 0.5;


  vec4 worldPosition = modelMatrix * vec4(p, 1.0);
	worldNormal = normalize(modelViewMatrix * vec4(normal, 0.)).xyz;
	viewDirection = normalize(worldPosition.xyz - cameraPosition);;

	gl_Position = projectionMatrix * modelViewMatrix * mvPosition;
}
