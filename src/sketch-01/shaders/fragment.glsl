#define PI 3.1415926
#define TWO_PI 6.2831852

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_mouse;
varying vec2 vUv;

float sqr3 = sqrt(3.);
float scale = 20. * 1.5; // roughly equal to the amount of vertical hexagons

// https://www.redblobgames.com/grids/hexagons/#pixel-to-hex
vec2 axialCoords(vec2 uv){
    // inverted hex-to-pixel matrix
    return vec2(uv.x * sqr3/3. - uv.y / 3., 2. * uv.y / 3.);
}

// https://www.redblobgames.com/grids/hexagons/#hex-to-pixel
vec2 hexToPixel(vec2 hex){
    float x = hex.x * sqr3  +  hex.y * sqr3 / 2.;
    float y = (3./2.) * hex.y;
    return vec2(x, y);
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

// rotate cube coorindates 60°. If idx is 2 => 120°, 4 => 180°, etc
vec3 rotate60(vec3 p, float idx){
    vec3 c;
    float md2 = mod(idx, 2.);
    float md3 = mod(idx, 3.);

    float sig = md2 == 0. ? 1. : -1.;
    if (md3 == 0.) { c = sig*p.xyz; }
    if (md3 == 1.) { c = sig*p.yzx; }
    if (md3 == 2.) { c = sig*p.zxy; }

    return c;
}

void main() {
    vec2 uv = vUv;
    vec2 mouseUv = u_mouse.xy;
    vec3 color = vec3(0., 0., 0.);

    uv *= scale;
    mouseUv *= scale;

    // global coordinates
    vec3 cubes = cubeCoords(uv);
    vec3 cubesRounded = cubeRound(cubes);

    // in cube coordiantes
    vec3 cubeXYZ = cubes - cubesRounded;
    vec3 cubeDist = abs(cubeXYZ.xyz - cubeXYZ.zxy);


    vec2 pixelUV = hexToPixel(cubeXYZ.xy);
    float angle = atan(pixelUV.y, pixelUV.x) + PI;

    // gl_FragColor = vec4(vec3(cubeDist.x), 1.);
    // gl_FragColor = vec4(vec3(pixelUV, 0.), 1.);
    // return;

    float borders = smoothstep(1., .95, max(cubeDist.x, max(cubeDist.y, cubeDist.z)));


    color = vec3(borders);
    // cubesRounded = rotate60(cubesRounded, 2.);

    float radius = floor(3. + 5. * (abs(sin(u_time*0.4))) + 0.5);
    // float radius = 4.;
    float t = u_time*0.4;
    float c1 = floor(4.*sin(t) + 0.5);
    float c2 = floor(4.*cos(t) + 0.5);
    float c3 = 0.;
    float distToCenter = abs(cubeDistance(cubesRounded, vec3(c1, c2, c3)));

     if (distToCenter == radius){
        color = vec3(0.3, 0.3, 0.3);
     }
     if (distToCenter < radius){
        //  float borders1 = 1.-smoothstep(.1, 0., cubeDist.x);
        // float borders2 = 1.-smoothstep(.1, 0., cubeDist.y);
        // float borders3 = 1.-smoothstep(.1, 0., cubeDist.z);
        // color = vec3(borders1);
        // color *= vec3(borders2);
        // color *= vec3(borders3);

        vec3 edges = cubeXYZ.xyz - cubeXYZ.zxy;
        float sm1 = smoothstep(0., 0.1, abs(edges.x));
        float sm2 = smoothstep(0., 0.1, abs(edges.y));
        float sm3 = smoothstep(0., 0.1, abs(edges.z));
        if (edges.y >= -0.03) { color *= vec3(sm1); }
        if (edges.z >= -0.03) { color *= vec3(sm2); }
        if (edges.x >= -0.03) { color *= vec3(sm3); }
     }

    // MOUSE
    vec3 mouseCube = cubeCoords(mouseUv);
    vec3 mouseRounded = cubeRound(mouseCube);

    float m1 = mouseRounded.x ;
    float m2 = mouseRounded.y;
    float m3 = mouseRounded.z;
    float distToCursor = abs(cubeDistance(cubesRounded, vec3(m1, m2, m3)));

    float cursor = 1.;
    if (distToCursor < 2.) {
        color = vec3(0.5 + distToCursor * 0.3);
    }
    float a = .4;
    color.rgb = 1. - color.rgb;
    if (color.r > 0.9) {
        a = 0.3;
    }
    gl_FragColor = vec4(color*vec3(0.3), a);
}
