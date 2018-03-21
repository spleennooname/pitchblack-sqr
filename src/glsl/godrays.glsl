//#vertex

precision mediump float;
precision lowp int;

attribute vec2 aPosition;
attribute vec2 aUV;

varying vec2 vUV;
varying vec4 vColor;
varying float vF;


void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vF = fract( sin( dot( aUV.yx + fract( aUV), vec2(42.9898, 50.233) ) ) * 43758.5453 );
    vUV = aUV;
}

//#fragment

precision mediump float;
precision lowp int;

uniform lowp sampler2D uTexture;
uniform float uTime;

varying vec3 vNormal;
varying vec2 vUV;
varying float vF;

//godray

#define EXPOSURE 0.25
#define NUM_SAMPLES 50

uniform float WEIGHT, DECAY_FACTOR, DENSITY;

float rand(float n){
  return fract(sin(n) * 43758.5453123);
}

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

void main(void){

  vec2 uv, tc, delta_tc;
  uv = tc = delta_tc = vUV;

  float t = uTime * 0.0018;

  delta_tc = uv + vec2( sin( t*.3)*.3, -cos(t*.2)*.3 ) - vec2(.5);
  delta_tc *= ( 1.0 / float(NUM_SAMPLES) ) * DENSITY;

  vec4 sample_tx, color = vec4(1.);
  float illumination_decay = 0.95;

  tc += delta_tc *vF ;

  for(int i=0; i < NUM_SAMPLES; i++) {
    tc -= delta_tc;
    sample_tx = texture2D(uTexture, tc ) * illumination_decay * WEIGHT;
    color += sample_tx * tc.y;
    illumination_decay *= DECAY_FACTOR ;
  }

  gl_FragColor = color * EXPOSURE;

}
