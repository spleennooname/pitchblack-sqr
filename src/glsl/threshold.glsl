
precision highp float;

attribute vec2 aPosition;
attribute vec2 aUV;

varying vec2 vUV;

void main(void) {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vUV = aUV;
}

//#fragment
precision highp float;

uniform sampler2D uTexture;

varying vec3 vNormal;
varying vec2 vUV;

//thresold
//https://www.shadertoy.com/view/4ssGR8

uniform float SOFT;
uniform float THRESHOLD;
uniform bool INVERT;

#define luma(r,g,b) ( 0.2126 * r + 0.7152 * g + 0.0722 * b )

void main(){

  vec2 uv = vUV;
  vec4 tx = texture2D(uTexture, uv);

  float lum = luma(tx.r, tx.g, tx.b);

  vec3 c = vec3(1.0);

  if ( INVERT == false)
      c -= smoothstep( THRESHOLD+SOFT, THRESHOLD-SOFT, lum);
  else
      c -= smoothstep( THRESHOLD+SOFT, THRESHOLD+SOFT, lum);

  gl_FragColor = vec4(c, 1.0);

}
