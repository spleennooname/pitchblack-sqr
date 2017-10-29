//import SqrCamMixin from "./vue/mixins/sqr";
//import ThreeCamMixin from "./vue/mixins/three";

// start app

const SHADERS = {
  threshold : require("../glsl/threshold.glsl"),
  godrays : require("../glsl/godrays.glsl")
}

const app = new Vue({

  el: '#ui',

  // mixins:[ SqrCamMixin  ],

  data: {
    show: 1,
    hud: 0,
    isTouch: false,
    noSupport: false,
    scaling: 1,
    params: {
      weight: 0.75,
      decay: 0.90,
      density: 0.85,
      quality: 2.75,
      samples: 20,
      threshold: 0.45,
      invert: false,
      soft: 0.001
    }
  },

  mounted() {
    this.$nextTick(this.run);
  },

  methods: {

    hasCam(){
        return !!navigator.getUserMedia || !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },

    run() {

      this.show = 0;

      this.constraints =  {
        video: {
            mandatory: {
                minAspectRatio: 1.25,
                maxAspectRatio: 1.6
            },
            optional: [{
                minWidth: 640
            }, {
                minHeight: 480
            }, {
                maxWidth: 960
            }, {
                maxHeight: 720
            }]
        }
      };

      if ( this.hasCam() ) {
          navigator.mediaDevices.getUserMedia(this.constraints)
            .then(this.done)
            .catch(this.fail);
      }
      else {
        this.noSupport = true;
      }
    },

    fail() {
      this.noSupport = true;
    },

    done( stream ){
      SQR.Loader.loadAssets([
        'webcam'
      ], this.onload);
    },

    onload( assets ) {

      this.video = assets.webcam;
      this.video.loop = true;
      this.video.muted = true;

      this.renderer = SQR.Renderer('#gl', {
        antialias: true
      }).clearColor(0.0, 0.0, 0.0, 1);

      this.rawFBO = SQR.FrameBuffer();
      this.postFBO = SQR.FrameBuffer();
      this.thresoldFBO = SQR.FrameBuffer();

      this.post = SQR.Primitives.createPostEffect(SHADERS.godrays);
      this.thresold = SQR.Primitives.createPostEffect(SHADERS.threshold);

      this.camera = SQR.Transform();
      this.camera.position.z = 2.5;

      //root
      this.root = SQR.Transform();
      this.root.add(this.camera);

      this.texture = SQR.Texture(this.video, {
        isAnimated: true,
        minFilter: this.renderer.context.gl.LINEAR,
        magFilter: this.renderer.context.gl.LINEAR
      });

      this.shader = SQR.Shader(SQR.GLSL.texture).use().setUniform('uTexture', this.texture);

      this.plane = SQR.Transform();
      this.plane.buffer = SQR.Primitives.createPlane(4, 3, 2, 2, 0, 0).update();
      this.plane.rotation.x = Math.PI / 2;
      this.plane.shader = this.shader;

      this.root.add(this.plane);

      this.scene();

    },

    scene( obj ) {

      this.hud = 1;
      this.show = 0;

      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(this.stats.domElement);

      this.isTouch = 'ontouchstart' in document;
      this.mousemove = this.isTouch ? 'touchmove' : 'mousemove';

      //
      // this.tx = 0;
      // this.ty = 0;
      // this.mx = 0;
      // this.my = 0;

      this.gui = new dat.GUI();

      var f = this.gui.addFolder('rays');
      f.add(this.params, 'weight', 0.1, 1.0);
      f.add(this.params, 'decay', 0.6, 1.0);
      f.add(this.params, 'density', 0.1, 1.0);
      f.open();

      //f.add(this.params, 'samples', 10.0, 25.0).step(1.0)
      //f.add(this.params, 'quality', 1, 4).step(1.0).onFinishChange( this.set_quality );

      f = this.gui.addFolder('black & white');
      f.add(this.params, 'invert');
      f.add(this.params, 'threshold', 0.02, 1.0);
      f.open();

      this.gui.add(this.params, 'quality', 1.0, 3.5).step(0.25).onChange(this.set_quality);

      this.then = Date.now();
      this.now = 0;
      this.fps = 50;
      window.addEventListener('resize', this.resize);
      this.render();
      this.resize();

    },

    save_screenshot(){
      this.render();
      var canvas = this.renderer.context.gl.canvas;
      var dataURL = canvas.toDataURL("image/jpeg");
      if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
          var t = new Date(),
              o = t.getFullYear() + "-" + t.getMonth() + "-" + t.getDate() + "_" + t.getHours() + "." + t.getMinutes() + "." + t.getSeconds(),
              a = document.createElement("a");
          a.href = dataURL, a.download = "pitchblack_" + o + ".jpg", a.click();
      } else {
        window.open(dataURL);
      }
    },

    set_quality(value) {
      this.scaling = 4 - value;
      this.resize();
    },

    draw() {

      if( !this.video || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
        return;
      }

      this.update();

    },

    update() {

      this.texture.update();

      this.rawFBO.bind();
      this.renderer.render(this.root, this.camera);

      this.thresoldFBO.bind();
      this.thresold.shader.use();
      this.thresold.shader.setUniform('THRESHOLD', this.params["threshold"]);
      this.thresold.shader.setUniform('SOFT', this.params["soft"]);
      this.thresold.shader.setUniform('INVERT', this.params["invert"]);
      this.thresold.shader.setUniform('uTexture', this.rawFBO.texture);
      this.renderer.render(this.thresold);

      this.renderer.renderToScreen();
      this.renderer.context.gl.viewport(0, 0, this.renderer.context.canvas.width, this.renderer.context.canvas.height);

      this.post.shader.use();
      this.post.shader.setUniform('WEIGHT', this.params["weight"]);
      this.post.shader.setUniform('DECAY_FACTOR', this.params["decay"]);
      //this.post.shader.setUniform('NUM_SAMPLES', this.params["samples"]);
      this.post.shader.setUniform('DENSITY', this.params["density"]);
      this.post.shader.setUniform('uTexture', this.thresoldFBO.texture);
      this.renderer.render(this.post);
    },

    render(timestamp) {

      requestAnimationFrame(this.render);

      this.stats.begin();
      this.now = Date.now();
      var delta = this.now - this.then;
      if (delta > (1000/this.fps)) {
        this.draw();
        this.then = this.now - (delta % (1000/this.fps) );
      }
      this.stats.end();

    },

    resize(e) {

      if (!this.video)
        return;

      var w = window.innerWidth,
        h = window.innerHeight,
        aspectRatio = this.video.videoWidth / this.video.videoHeight

      h = this.video.videoHeight;
      w = h * aspectRatio;

      this.rawFBO.resize(w / this.scaling, h / this.scaling);
      this.postFBO.resize(w / this.scaling, h / this.scaling);
      this.thresoldFBO.resize(w / this.scaling, h / this.scaling);
      this.renderer.context.size(w / this.scaling, h / this.scaling, window.devicePixelRatio);
      this.camera.projection = new SQR.ProjectionMatrix().perspective(70, aspectRatio, 1, 1000);
    }

  }
});
