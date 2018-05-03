import Vue from "vue";
import screenfull from "screenfull";

const SHADERS = {
  threshold : require("../glsl/threshold.glsl"),
  godrays : require("../glsl/godrays.glsl")
}

const app = new Vue({

  el: '#app',

  data: {
    show: 1,
    hud: 0,
    isTouch: false,
    noSupport: false,
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

      this.scaling = 1;

      this.params = {
        weight: 0.75,
        decay: 0.90,
        density: 0.85,
        quality: 1.5,
        samples: 20,
        threshold: 0.45,
        invert: false,
        soft: 0.001
      }

      this.constraints =  {
        audio: false,
        video: {
          width: { min: 640, max: 1920 },
          height: { min: 480, max: 1080 },
          frameRate: { ideal: 50, max: 60 }
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
      this.video = document.createElement("video");
      this.video.srcObject = stream;
      this.video.loop = true;
      this.video.muted = true;
      this.video.autoPlay = true;
      this.video.onloadedmetadata =  this.onload;
    },

    onload() {

      var hash = window.location.hash.substring(1);
      this.scaling = hash !== "" ? parseFloat(hash) : 1.5;

      this.fps_ms = 1000 / 60;

      this.video.play();

      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(this.stats.domElement);

      this.renderer = SQR.Renderer("#gl");
      this.renderer.clearColor(0.0, 0.0, 0.0, 1);
      this.context = this.renderer.context;
      this.canvas = this.renderer.context.gl.canvas;

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
        minFilter: this.renderer.context.gl.LINEAR,
        magFilter: this.renderer.context.gl.LINEAR
      });

      this.shader = SQR.Shader(SQR.GLSL.texture).use().setUniform('uTexture', this.texture);

      var aspectRatio = this.video.videoWidth / this.video.videoHeight ;

      this.plane = SQR.Transform();
      this.plane.buffer = SQR.Primitives.createPlane( 4*aspectRatio, 4, 2, 2, 0, 0).update();
      this.plane.rotation.x = 90 * (Math.PI / 180);
      this.plane.shader = this.shader;

      this.root.add(this.plane);

      this.hud = 1;
      this.show = 0;



      this.isTouch = "ontouchstart" in document;
      this.mousemove = this.isTouch ? "touchmove" : "mousemove";
      this.gui = new dat.GUI();

      var f = this.gui.addFolder("rays");
      f.add(this.params, "weight", 0.1, 1.0);
      f.add(this.params, "decay", 0.8, 1.0);
      f.add(this.params, "density", 0.1, 1.0);
      f.open();

      f = this.gui.addFolder("black & white");
      f.add(this.params, "invert");
      f.add(this.params, "threshold", 0.02, 1.0);
      f.open();

      this.gui
        .add(this.params, "quality", 1.0, 3.5)
        .step(0.25)
        .onChange(this.set_quality);


      this.then = window.performance.now();
      this.now = 0;
      this.fps = 60;

      this.resize();
      window.addEventListener("resize", this.resize);

      this.render();

    },

    save_screenshot(){

      this.draw();

      var canvas = this.renderer.context.gl.canvas;
      var dataURL = canvas.toDataURL("image/jpeg");
      if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
          var t = new Date(),
              o = t.getFullYear() + "-" + t.getMonth() + "-" + t.getDate() + "_" + t.getHours() + "." + t.getMinutes() + "." + t.getSeconds(),
              a = document.createElement("a");
          a.href = dataURL, a.download = "pitchblack_" + o + ".jpg", a.click();
      } else {
        window.open(dataURL,"_blank","fullscreen=1");
      }
    },

    set_quality(value) {
      this.scaling = 4 - value;
      this.resize();
    },

    draw() {

      if(  !this.video || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
        return;
      }

      //console.log("draw ", this.video.readyState, this.video.HAVE_ENOUGH_DATA)

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
      this.renderer.context.gl.viewport(0, 0, this.renderer.context.gl.drawingBufferWidth, this.renderer.context.gl.drawingBufferHeight);

      this.post.shader.use();
      this.post.shader.setUniform('WEIGHT', this.params["weight"]);
      this.post.shader.setUniform('DECAY_FACTOR', this.params["decay"]);
      this.post.shader.setUniform('DENSITY', this.params["density"]);
      this.post.shader.setUniform('uTexture', this.thresoldFBO.texture);
      this.renderer.render(this.post);

    },

    render() {
      requestAnimationFrame(this.render);
      this.stats.begin();
      this.now = window.performance.now();
      var delta = this.now - this.then;
      if (delta > this.fps_ms) {
        this.then = this.now - (delta % this.fps_ms );
        this.draw();
      }
      this.stats.end();
    },

    resize(){

          var aspectRatio = this.video.videoWidth / this.video.videoHeight ;
          var w = this.video.videoWidth / this.scaling;
          var h = this.video.videoHeight / this.scaling;

         // console.log("***", this.video.videoWidth , this.scaling, w, h)
         // this.canvas.width = w;
          //this.canvas.height = h;

          this.rawFBO.resize(w, h);
          this.postFBO.resize(w, h);
          this.thresoldFBO.resize(w, h);
          this.renderer.context.size(w, h, window.devicePixelRatio);
          this.camera.projection = new SQR.ProjectionMatrix().perspective(70, aspectRatio, 1, 1000);

    }

  }
});
