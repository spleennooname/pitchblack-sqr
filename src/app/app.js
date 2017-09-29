// start app

const app = new Vue({

  el: '#ui',

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
      quality: 3,
      samples: 20,
      threshold: 0.28,
      invert: false,
      soft: 0.001
    }
  },

  mounted() {
    this.$nextTick(this.run);
  },

  methods: {

    run() {

      this.show = 0;
      this.constraints = {
        audio: false,
        video: {
          mandatory: { minWidth: 640, minHeight: 480 },
          optional: [
            { minFrameRate: 35 },
            { maxWidth: 640 },
            { maxHeigth: 480 }
          ]
        }
      }

      if (typeof navigator.mediaDevices !== "undefined"){
        if (!!navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia(this.constraints)
            .then(this.done)
            .catch(this.fail);
        }
      }
      else {
        this.noSupport = true;
      }

    },

    done(stream) {

      this.stream = stream;

      SQR.Loader.loadAssets([
        ['glsl/thresold.glsl', 'thresold.glsl'],
        ['glsl/godray.glsl', 'post.glsl'],
        'webcam'
        ], this.sqr);
    },

    fail() {
      this.noSupport = true;
    },

    sqr(assets) {

      this.hud = 1;
      this.show = 0;

      this.video = assets.webcam;
      //assets.webcam.srcObject = this.stream;

      // console.log("sqr", assets.webcam)

      //console.log(this.video, this.video instanceof HTMLVideoElement, this);

      // this.stats = new Stats();
      // this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      // document.body.appendChild(this.stats.domElement);

      this.renderer = SQR.Renderer('#gl', {
          antialias: true
        })
        .clearColor(0.0, 0.0, 0.0, 1);

      //console.log( this.renderer)

      this.rawFBO = SQR.FrameBuffer();
      this.postFBO = SQR.FrameBuffer();
      this.thresoldFBO = SQR.FrameBuffer();

      this.post = SQR.Primitives.createPostEffect(assets['post.glsl']);
      this.thresold = SQR.Primitives.createPostEffect(assets['thresold.glsl']);

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
      this.plane.buffer = SQR.Primitives.createPlane(4, 4, 8, 8, 0, 0).update();
      this.plane.rotation.x = Math.PI / 2;
      this.plane.shader = this.shader;

      this.root.add(this.plane);

      //events

      this.isTouch = 'ontouchstart' in document;
      this.mousemove = this.isTouch ? 'touchmove' : 'mousemove';
      window.addEventListener('resize', this.resize);

      this.tx = 0;
      this.ty = 0;
      this.mx = 0;
      this.my = 0;

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

      // this.gui.add(this.params, 'quality', {
      //   High: 1,
      //   Mid: 2,
      //   Low: 3
      // }).onChange(this.set_quality);

      //console.log( this.texture.getSource().videoWidth, this.texture.getSource().videoHeight );

      this.lastFrameTimeMs = Date.now();
      this.resize();
      this.render();

    },

    // set_weight: function (value) {
    //   // this.post.shader.setUniform('WEIGHT', value);
    // },
    //
    // set_decay: function (value) {
    //   // this.post.shader.setUniform('DECAY_FACTOR', value);
    // },
    //
    // set_density: function (value) {
    //   // this.post.shader.setUniform('DENSITY', value);
    // },

    set_quality(value) {
      // this.post.shader.setUniform('DENSITY', value);
      this.scaling = 4 - value;
      this.resize();
    },

    draw() {

      if( !this.video){
        return;
      }
      if (this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
        return;
      }

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

      // Throttle the frame rate.
       if (timestamp < this.lastFrameTimeMs + (1000 / 50 )) {
           requestAnimationFrame(this.render);
           return;
       }
       this.lastFrameTimeMs = timestamp;

      this.draw();

      requestAnimationFrame(this.render);

    },

    resize(e) {

      var w = window.innerWidth,
          h = window.innerHeight,
          wCam = this.video.videoWidth;

      w = w > wCam ? wCam : w;
      h = w / (16 / 9); // 9/16 * 100

      var aspect = w / h;
      // console.log(this.scaling, ":",w / this.scaling, h / this.scaling);

      this.rawFBO.resize(w / this.scaling, h / this.scaling);
      this.postFBO.resize(w / this.scaling, h / this.scaling);
      this.thresoldFBO.resize(w / this.scaling, h / this.scaling);

      this.renderer.context.size(w / this.scaling, h / this.scaling, window.devicePixelRatio);
      this.camera.projection = new SQR.ProjectionMatrix().perspective(70, aspect, 1, 1000);
    }

  }
});
