#define PI 3.1415926
#define TWO_PI 6.2831852

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_texture;
varying vec2 vUv;
varying vec2 vTextureUv;
varying vec3 worldNormal;
varying vec3 viewDirection;

float ior = 1.5;
float a = 0.33;
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

// https://tympanus.net/codrops/2019/10/29/real-time-multiside-refraction-in-three-steps/
float Fresnel(vec3 eyeVector, vec3 worldNormal) {
	return pow( 1.0 + dot( eyeVector, worldNormal), 3.0 );
}


void main()	{
    vec2 uv = vUv;

    vec3 refracted = refract(viewDirection, worldNormal, 1.0/ior);
    vec2 textureUv = vTextureUv + refracted.xy;

    vec4 img = texture2D(u_texture, textureUv);

    vec3 cubes = cubeCoords(uv);
    vec3 cubesRounded = cubeRound(cubes);

    // cube inner coordiantes
    vec3 cubeXYZ = cubes - cubesRounded;
    vec3 cubeDist = abs(cubeXYZ.xyz - cubeXYZ.zxy);


    float borders = max(0.1, smoothstep(.95, 1., max(cubeDist.x, max(cubeDist.y, cubeDist.z))));

    float f = Fresnel(viewDirection, worldNormal);

    vec3 color = img.rgb;
    color.rgb = mix(color.rgb, vec3(1.0), f);
    color = max(color.rgb, 0.4*borders);

    gl_FragColor = vec4(color, 1.0);
}
