#ifdef GL_ES
precision highp float;
#endif

attribute vec2 aPosition;
attribute vec2 aUV;

varying vec2 vUV;

void main(void) {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vUV = aUV;
}

//#fragment
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexture;
uniform float uTime;

varying vec3 vNormal;
varying vec2 vUV;

//godray
//https://www.shadertoy.com/view/4ssGR8

//#define DECAY_FACTOR 0.75
#define EXPOSURE 0.21
//#define DENSITY 0.85
//#define WEIGHT 0.58

#define NUM_SAMPLES 28

uniform float WEIGHT;
uniform float DECAY_FACTOR;
uniform float DENSITY;


float rand(float n){return fract(sin(n) * 43758.5453123);}

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}


float noise(float p){
	float fl = floor(p);
  float fc = fract(p);
	return mix(rand(fl), rand(fl + 1.0), fc);
}

float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

// float noise_v2(vec2 n) {
// 	const vec2 d = vec2(0.0, 1.0);
//   vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
// 	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
// }

void main(){

  vec2 uv = vUV;
  vec2 tc = uv;
  vec2 delta_tc = uv;

  float t = uTime;

  t *= 0.0016;

  delta_tc = uv + vec2( sin( t*.3)*.3, -cos(t*.2)*.3 ) - .5;
  delta_tc *= 1.0 / float(NUM_SAMPLES) * DENSITY;

  float illumination_decay = 0.95;
  vec4 color = texture2D(uTexture, tc) ;
  vec4 sample_tx;

  tc += delta_tc * fract( sin( dot( uv.xy + fract( tc ), vec2(42.9898, 50.233) ) ) * 43758.5453 );

  for(int i=0; i < NUM_SAMPLES; i++) {
    tc -= delta_tc;
    sample_tx = texture2D(uTexture, tc ) * illumination_decay * WEIGHT;
    //sample_tx *= illumination_decay * WEIGHT;
    color += sample_tx * noise( vec2(tc.y, tc.x) ) ;
    illumination_decay *= DECAY_FACTOR ;
  }

  vec4 c = color;

  gl_FragColor = c * EXPOSURE;

}
