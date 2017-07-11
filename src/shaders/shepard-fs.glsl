
  #ifdef GL_ES
    precision mediump float;
  #endif

  //uniforms

  uniform float time;
  uniform sampler2D map;
  uniform vec2 resolution;

  //clubber
  uniform vec4 iMusic1;
  uniform vec4 iMusic2;
  uniform vec4 iMusic3;

  varying vec2 vUv;

  //constants

  #define GAMMA 1.0

  #define PI 3.14159265358979

  #define BASE_COL vec3(1., 1., 1.)

  #define BLACK vec3(0., 0., 0.)

  #define WHITE vec3(1., 1., 1.)

  //get texel
  #define tx( map, uv, lod) (texture2D( map, uv, lod) )

  //get luma from texel
  #define luma( t ) ( 0.2126*t.x + 0.7152*t.y + 0.0722*t.z )

  //short for vec2 resolution
  #define res resolution.xy

  //iq random stuff

  mat2 rot2d(float angle){
      return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  }

  float r(float a, float b){return fract(sin(dot(vec2(a,b),vec2(12.9898,78.233)))*43758.5453);}

  float h(float a){return fract(sin(dot(a,dot(12.9898,78.233)))*43758.5453);}

  float noise(vec3 x){
      vec3 p  = floor(x);
      vec3 f  = fract(x);
      f       = f*f*(3.0-2.0*f);
      float n = p.x + p.y*57.0 + 113.0*p.z;
      return mix(mix(mix( h(n+0.0), h(n+1.0),f.x),
                     mix( h(n+57.0), h(n+58.0),f.x),f.y),
                 mix(mix( h(n+113.0), h(n+114.0),f.x),
                     mix( h(n+170.0), h(n+171.0),f.x),f.y),f.z);
  }

  // http://www.iquilezles.org/www/articles/morenoise/morenoise.htm
  // http://www.pouet.net/topic.php?post=401468

  vec3 dnoise2f(vec2 p){
      float i = floor(p.x), j = floor(p.y);
      float u = p.x-i, v = p.y-j;
      float du = 30.*u*u*(u*(u-2.)+1.);
      float dv = 30.*v*v*(v*(v-2.)+1.);
      u=u*u*u*(u*(u*6.-15.)+10.);
      v=v*v*v*(v*(v*6.-15.)+10.);
      float a = r(i,     j    );
      float b = r(i+1.0, j    );
      float c = r(i,     j+1.0);
      float d = r(i+1.0, j+1.0);
      float k0 = a;
      float k1 = b-a;
      float k2 = c-a;
      float k3 = a-b-c+d;
      return vec3(k0 + k1*u + k2*v + k3*u*v,
                  du*(k1 + k3*v),
                  dv*(k2 + k3*u));
  }

  float fbm(vec2 uv, float time){
      vec2 p = uv;
      float f, dx, dz, w = 0.5;
      f = dx = dz = 0.0;
      for(int i = 0; i < 28; ++i){
          vec3 n = dnoise2f(uv);
          dx += n.y;
          dz += n.z;
          f += w * n.x / (1.0 + dx*dx + dz*dz);
          w *= 0.86;
          uv *= vec2(1.16);
          uv *= rot2d(1.25*noise(vec3(p*0.1, 0.12*time))+
                      0.75*noise(vec3(p*0.1, 0.20*time)));
      }
      return f;
  }

  float fbmLow(vec2 uv){
      float f, dx, dz, w = 0.5;
      f = dx = dz = 0.0;
      for(int i = 0; i < 4; ++i){
          vec3 n = dnoise2f(uv);
          dx += n.y;
          dz += n.z;
          f += w * n.x / (1.0 + dx*dx + dz*dz);
          w *= 0.75;
          uv *= vec2(1.5);
      }
      return f;
  }

  //end iq

  float aastep(float threshold, float value) {
      float afwidth = 0.95 * length( vec2(dFdx(value), dFdy(value)) );
      return smoothstep( threshold-afwidth, threshold+afwidth, value);
  }

  //get texel
  vec4 tex(sampler2D map, vec2 uv, float lod)
  {
      vec4 e= smoothstep( vec4(-0.15), vec4(.15), vec4(uv, vec2(1)-uv) ) ;
      float mask=e.x*e.y*e.z*e.w;
      return tx(map, uv, lod) * mask;
  }

  //rotation
  vec2 rot(vec2 vec, float angle) {
      float c, s ;
      s = sin(angle);
      c = cos(angle);
      return mat2(c, s, -s, c) * vec;
  }

  // MAIN

  void main(){

     vec2 uv = vUv;
     vec3 col;
     float t = time * .005;

    //get px
     vec4 texel = tex(map, uv, 10.);

     //get luma
     float lum = luma( texel );

      //0 * Most powerful note index
      //1   Least powerfull note index
      //2   Power weighted note average
      //3 * Power of the strongest note
      //4   Average power of active notes
      //5   Power weighted average midi index
      //6 * Power weighted average octave index
      //7   Ratio of spectrum window area covered
      //8   Adaptive low threshold relative to bounds
      //9   Adaptive high threshold relative to bounds

     //iMusic1: 1-32hz, templ.4560  - xyzw
     //iMusic2: 32-48hz, templ.4560 - xyzw
     //iMusic3: 48-96hz, templ.0124 - xyzw

     //clubber mods
     float m0 = 1.0 * mix( iMusic1.w*iMusic2.y, iMusic3.z, iMusic3.w);
     float m1 = mix( iMusic1.x, iMusic1.y, time * .05);
     float m2 = mix( iMusic1.x, iMusic2.y, time * .15);

     //noise
     //float n = fbm( uv*vec2( .35, m1*m0 ), time * .05);
     float n =  .05 * fbmLow( vec2( uv.x, uv.y*m2) );
     //n += .05 * fbmLow( vec2(uv.x, uv.y*m2) );

     //nb: radiants (90° =  PI/2 = 1.57)
     float mm =  PI * cos( t*t ) ;
     vec2 dith = rot( gl_FragCoord.xy, mm );

     //amplitude
     float amp= mix( 5., 1., (1. + n*n)*cos(time * 0.055) );

     //density
     float density = (30. + 15. * sin( exp(cos( time* .0015 )) * 2.) );
     float k= (dith.y + n + dith.y*n) / density;

     float line = aastep( mod( k, amp ), lum ) * lum;

     //out
     float c =  1. - pow( line , GAMMA );

     gl_FragColor = vec4( vec3(c), 1.0);

  }
