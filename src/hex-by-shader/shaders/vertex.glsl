uniform float u_time;
uniform vec3 u_mouse;
uniform vec2 u_resolution;

varying vec2 vUv;

vec2 normUV(in vec2 uv){
    float aspect = u_resolution.x/u_resolution.y;
    if (aspect > 1.){
        uv = (uv - .5) * u_resolution.xy / u_resolution.y;
    } else {
        uv = (uv - .5) * u_resolution.xy / u_resolution.x;
    }
    return uv;
}

void main() {
    vUv = normUV(uv);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
