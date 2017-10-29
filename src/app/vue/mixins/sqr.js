export default {

  methods: {

    load() {

      SQR.Loader.loadAssets([
        ['glsl/thresold.glsl', 'thresold.glsl'],
        ['glsl/godray.glsl', 'post.glsl'],
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
      this.plane.buffer = SQR.Primitives.createPlane(4, 3, 2, 2, 0, 0).update();
      this.plane.rotation.x = Math.PI / 2;
      this.plane.shader = this.shader;

      this.root.add(this.plane);

      this.scene();

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
}
