#define PI 3.1415926
#define TWO_PI 6.2831852

uniform vec2 u_resolution;
uniform float u_time;
varying vec2 vUv;

float sqr3 = sqrt(3.);

// https://www.redblobgames.com/grids/hexagons/#pixel-to-hex
vec2 axialCoords(vec2 uv){
    // inverted hex-to-pixel matrix
    return vec2(uv.x * sqr3/3. - uv.y / 3., 2. * uv.y / 3.);
}

// https://www.redblobgames.com/grids/hexagons/#coordinates-cube
// Cube diaganal plane equation is x + y + z = 0, hence z = - x - y;
vec3 cubeCoords(vec2 uv) {
    vec2 ax = axialCoords(uv);
    return vec3(ax, -ax.x - ax.y);
}

// https://www.redblobgames.com/grids/hexagons/#rounding
vec3 cubeRound(in vec3 p){
    vec3 r = floor(p + .5);
    vec3 d = abs(p - r);
    if (d.x > d.y && d.x > d.z) { r.x = -r.y - r.z; }
    else if (d.y > d.z) { r.y = -r.x - r.z; }
    else { r.z = -r.x - r.y; }
    return r;
}

// https://www.redblobgames.com/grids/hexagons/#distances
float cubeDistance(vec3 a, vec3 b) {
    vec3 d = abs(a - b);
    return max(d.x, max(d.y, d.z));
}

void main()	{
    vec2 uv = vUv;

    vec3 cubes = cubeCoords(uv);
    vec3 cubesRounded = cubeRound(cubes);

    // in cube coordiantes
    vec3 cubeXYZ = cubes - cubesRounded;
    vec3 cubeDist = abs(cubeXYZ.xyz - cubeXYZ.zxy);

    vec3 color = vec3(0.);

    float borders = smoothstep(.9, 1., max(cubeDist.x, max(cubeDist.y, cubeDist.z)));

    // gl_FragColor = vec4(uv, 0., 1.);
    gl_FragColor = vec4(color, borders);
}
