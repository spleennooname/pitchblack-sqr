// start app
var app = new Vue({
  el: '#ui',
  data: {
    show: 1,
    constraints : {
       audio: false,
      video: { frameRate: { ideal: 40, max: 60 } }
    }
  },
  mounted: function(){
    this.run();
  },
  methods:{
    
     run: function(){
       this.show = 0;
       
         console.log("run")
       SQR.Loader.loadAssets([
          ['images/a.jpg', 'face']
       ], this.sqr);
     },
    
    done: function(stream){

      
     
    },
    
    fail: function(){
      
      
    },
    
    sqr: function( assets ){
      
        this.renderer = SQR.Renderer('#gl', { antialias: true }).clearColor(0, 0.14, 0.18, 1);
        this.ctx = this.renderer.context;

        this.camera = SQR.Transform();
        this.camera.position.z = 5;
      
        this.root = SQR.Transform();
        this.root.add(this.camera);
      
        var tex = SQR.Texture(assets['face']);
      
      console.log("assets", assets)
      
        //this.camTexture = SQR.Texture( this.video );
      
        /*this.camPlane = SQR.Transform();
        this.camPlane.buffer = SQR.Primitives.createPlane(24, 24, 48, 48);
        this.camPlane.shader = SQR.Shader(SQR.GLSL.texture)
              .setUniform('uTexture', this.camTexture)
              .use()
      
        this.root.add(this.camPlane);*/
      
        /**this.blur = SQR.Primitives.createPostEffect(assets.blurShader);
        this.blur.uniforms = {
          uDelta: new SQR.V2()
        };*/
      
        var shader = SQR.Shader(SQR.GLSL.texture).use();//.setUniform('uTexture', tex);
      
        this.cube = SQR.Transform();
        this.cube.buffer = SQR.Primitives.createCube(2, 2, 2).update();
        this.cube.shader = shader;
      
        this.root.add(this.cube);
        
        window.addEventListener('resize', this.resize);
        this.resize();
        this.render();
    },
    
    draw : function(){
      // Rotate the cube a bit on each frame
      this.cube.rotation.x += 0.005;
      this.cube.rotation.y += 0.01;
      
      //this.camTexture.update();
      //this.camPlane.buffer.mesh.calculateNormals(true).update()
    },
    
    render: function(){
      requestAnimationFrame(this.render);
      this.draw();
      this.renderer.render(this.root, this.camera);
    },
    
    resize:function(e){
      var w = window.innerWidth, 
          h = window.innerHeight, 
          aspect = w/h;
      this.ctx.size(w, h, window.devicePixelRatio);
      this.camera.projection = new SQR.ProjectionMatrix().perspective(70, aspect, 1, 1000);
    }
    
  }
});
