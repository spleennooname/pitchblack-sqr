export default {

  methods: {

    load( stream){

      this.onload( stream );
    },

    onload(stream) {

      this.video = document.createElement("video");
      this.video.srcObject = stream;

      // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
      // See crbug.com/110938.
      this.video.onloadedmetadata = e => {
        //   // Ready to go. Do some stuff.
      };

      this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);

      this.camera.position.x = 0;
      this.camera.position.y = 0;
      this.camera.position.z = -5;
      this.camera.fov = 2 * Math.atan(((window.innerWidth) / camera.aspect) / (2 * 1175)) * (180 / Math.PI);;
      this.camera.updateProjectionMatrix();

      // Scene
      this.scene = new THREE.Scene();

      this.video = webcamSrc;

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        preserveDrawingBuffer: true
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      document.getElementById("gl").appendChild(this.renderer.domElement);

      // Controls
      this.controls = new THREE.OrbitControls(camera, renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.25;
      this.controls.enableZoom = false;

      // Lights
      this.scene.add(new THREE.AmbientLight(0xffffff));

      // Webcam Texture / Material
      this.webcamTexture = new THREE.VideoTexture(this.video);
      this.webcamTexture.minFilter = THREE.LinearFilter;
      this.webcamTexture.magFilter = THREE.LinearFilter;
      this.webcamTexture.format = THREE.RGBFormat;

      //material
      this.webcamMaterial = new THREE.MeshLambertMaterial({
        map: this.webcamTexture
      });

      //plane
      this.geometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);

      this.mesh = new THREE.Mesh(this.geometry, this.webcamMaterial);
      this.mesh.rotation.x = THREE.Math.degToRad(-45);
      this.scene.add(this.mesh);

      //post setup

      // this.composer = new THREE.EffectComposer( this.renderer );
      //
      // var renderPass = new THREE.RenderPass( this.scene, this.camera );
      // this.composer.addPass( RenderPass );
      //
      // var shaderPass = new THREE.ShaderPass( this.filters[ this.currentFilterIndex ] );
      // composer.addPass(shaderPass)

      // var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
      // effect.uniforms[ 'amount' ].value = 0.0015;
      // effect.renderToScreen = true;
      // composer.addPass( effect );

    },

    resize(e) {

      if (!this.video)
        return;

      var w = window.innerWidth,
        h = window.innerHeight,
        aspectRatio = this.video.videoWidth / this.video.videoHeight

      h = this.video.videoHeight;
      w = h * aspectRatio;

      this.camera.aspect = aspectRatio;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w / this.scaling, h / this.scaling);

    },

    update() {

      var w = this.video.videoWidth,
        h = this.video.videoHeight;

      this.webcamTexture.update();
      this.controls.update();
      this.camera.lookAt(this.scene.position);
      this.render(this.scene, this.camera);
    }

  }

}
