!function(t){function e(r){if(i[r])return i[r].exports;var s=i[r]={i:r,l:!1,exports:{}};return t[r].call(s.exports,s,s.exports,e),s.l=!0,s.exports}var i={};e.m=t,e.c=i,e.d=function(t,i,r){e.o(t,i)||Object.defineProperty(t,i,{configurable:!1,enumerable:!0,get:r})},e.n=function(t){var i=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(i,"a",i),i},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=0)}([function(t,e,i){t.exports=i(1)},function(t,e,i){"use strict";i(2),i(3),i(4),i(5),i(6),i(9)},function(t,e){},function(t,e){},function(t,e){},function(t,e,i){"use strict";/*! @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js */
!function(t){var e,i=t.Uint8Array,r=t.HTMLCanvasElement,s=r&&r.prototype,n=/\s*;\s*base64\s*(?:;|$)/i,o="toDataURL",a=function(t){for(var r,s,n=t.length,o=new i(n/4*3|0),a=0,h=0,d=[0,0],c=0,l=0;n--;)s=t.charCodeAt(a++),255!==(r=e[s-43])&&void 0!==r&&(d[1]=d[0],d[0]=s,l=l<<6|r,4===++c&&(o[h++]=l>>>16,61!==d[1]&&(o[h++]=l>>>8),61!==d[0]&&(o[h++]=l),c=0));return o};i&&(e=new i([62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,0,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51])),!r||s.toBlob&&s.toBlobHD||(s.toBlob||(s.toBlob=function(t,e){if(e||(e="image/png"),this.mozGetAsFile)return void t(this.mozGetAsFile("canvas",e));if(this.msToBlob&&/^\s*image\/png\s*(?:$|;)/i.test(e))return void t(this.msToBlob());var r,s=Array.prototype.slice.call(arguments,1),h=this[o].apply(this,s),d=h.indexOf(","),c=h.substring(d+1),l=n.test(h.substring(0,d));Blob.fake?(r=new Blob,r.encoding=l?"base64":"URI",r.data=c,r.size=c.length):i&&(r=l?new Blob([a(c)],{type:e}):new Blob([decodeURIComponent(c)],{type:e})),t(r)}),!s.toBlobHD&&s.toDataURLHD?s.toBlobHD=function(){o="toDataURLHD";var t=this.toBlob();return o="toDataURL",t}:s.toBlobHD=s.toBlob)}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||(void 0).content||void 0)},function(t,e,i){"use strict";var r,s=s||function(t){if(!(void 0===t||"undefined"!=typeof navigator&&/MSIE [1-9]\./.test(navigator.userAgent))){var e=t.document,i=function(){return t.URL||t.webkitURL||t},r=e.createElementNS("http://www.w3.org/1999/xhtml","a"),s="download"in r,n=function(t){var e=new MouseEvent("click");t.dispatchEvent(e)},o=/constructor/i.test(t.HTMLElement)||t.safari,a=/CriOS\/[\d]+/.test(navigator.userAgent),h=function(e){(t.setImmediate||t.setTimeout)(function(){throw e},0)},d=function(t){var e=function(){"string"==typeof t?i().revokeObjectURL(t):t.remove()};setTimeout(e,4e4)},c=function(t,e,i){e=[].concat(e);for(var r=e.length;r--;){var s=t["on"+e[r]];if("function"==typeof s)try{s.call(t,i||t)}catch(t){h(t)}}},l=function(t){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type)?new Blob([String.fromCharCode(65279),t],{type:t.type}):t},u=function(e,h,u){u||(e=l(e));var f,m=this,p=e.type,v="application/octet-stream"===p,g=function(){c(m,"writestart progress write writeend".split(" "))};if(m.readyState=m.INIT,s)return f=i().createObjectURL(e),void setTimeout(function(){r.href=f,r.download=h,n(r),g(),d(f),m.readyState=m.DONE});!function(){if((a||v&&o)&&t.FileReader){var r=new FileReader;return r.onloadend=function(){var e=a?r.result:r.result.replace(/^data:[^;]*;/,"data:attachment/file;");t.open(e,"_blank")||(t.location.href=e),e=void 0,m.readyState=m.DONE,g()},r.readAsDataURL(e),void(m.readyState=m.INIT)}if(f||(f=i().createObjectURL(e)),v)t.location.href=f;else{t.open(f,"_blank")||(t.location.href=f)}m.readyState=m.DONE,g(),d(f)}()},f=u.prototype,m=function(t,e,i){return new u(t,e||t.name||"download",i)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(t,e,i){return e=e||t.name||"download",i||(t=l(t)),navigator.msSaveOrOpenBlob(t,e)}:(f.abort=function(){},f.readyState=f.INIT=0,f.WRITING=1,f.DONE=2,f.error=f.onwritestart=f.onprogress=f.onwrite=f.onabort=f.onerror=f.onwriteend=null,m)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||(void 0).content);void 0!==t&&t.exports?t.exports.saveAs=s:null!==i(7)&&null!==i(8)&&void 0!==(r=function(){return s}.call(e,i,e,t))&&(t.exports=r)},function(t,e){t.exports=function(){throw new Error("define cannot be used indirect")}},function(t,e){(function(e){t.exports=e}).call(e,{})},function(t,e,i){"use strict";function r(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}var s;new Vue({el:"#ui",data:{show:1,hud:0,isTouch:!1,noSupport:!1,scaling:1,params:{weight:.75,decay:.9,density:.85,quality:3,samples:20,threshold:.28,invert:!1,soft:.001}},mounted:function(){this.$nextTick(this.run)},methods:(s={run:function(){this.show=0,this.constraints={audio:!1,video:{mandatory:{minWidth:640,minHeight:480},optional:[{minFrameRate:35},{maxWidth:640},{maxHeigth:480}]}},void 0!==navigator.mediaDevices?navigator.mediaDevices.getUserMedia&&navigator.mediaDevices.getUserMedia(this.constraints).then(this.done).catch(this.fail):this.noSupport=!0},save_screenshot:function(){console.log(this.renderer.context.gl.canvas)},done:function(t){this.stream=t,SQR.Loader.loadAssets([["glsl/thresold.glsl","thresold.glsl"],["glsl/godray.glsl","post.glsl"],"webcam"],this.sqr)},fail:function(){this.noSupport=!0},sqr:function(t){this.hud=1,this.show=0,this.video=t.webcam,this.params.save=this.save_screenshot,this.renderer=SQR.Renderer("#gl",{antialias:!0}).clearColor(0,0,0,1),this.rawFBO=SQR.FrameBuffer(),this.postFBO=SQR.FrameBuffer(),this.thresoldFBO=SQR.FrameBuffer(),this.post=SQR.Primitives.createPostEffect(t["post.glsl"]),this.thresold=SQR.Primitives.createPostEffect(t["thresold.glsl"]),this.camera=SQR.Transform(),this.camera.position.z=2.5,this.root=SQR.Transform(),this.root.add(this.camera),this.texture=SQR.Texture(this.video,{isAnimated:!0,minFilter:this.renderer.context.gl.LINEAR,magFilter:this.renderer.context.gl.LINEAR}),this.shader=SQR.Shader(SQR.GLSL.texture).use().setUniform("uTexture",this.texture),this.plane=SQR.Transform(),this.plane.buffer=SQR.Primitives.createPlane(4,4,8,8,0,0).update(),this.plane.rotation.x=Math.PI/2,this.plane.shader=this.shader,this.root.add(this.plane),this.isTouch="ontouchstart"in document,this.mousemove=this.isTouch?"touchmove":"mousemove",window.addEventListener("resize",this.resize),this.tx=0,this.ty=0,this.mx=0,this.my=0,this.gui=new dat.GUI;var e=this.gui.addFolder("rays");e.add(this.params,"weight",.1,1),e.add(this.params,"decay",.6,1),e.add(this.params,"density",.1,1),e.open(),e=this.gui.addFolder("black & white"),e.add(this.params,"invert"),e.add(this.params,"threshold",.02,1),e.open(),this.gui.add(this.params,"quality",1,3.5).step(.25).onChange(this.set_quality),this.gui.add(this.params,"save").name("take screenshot!"),this.lastFrameTimeMs=Date.now(),this.render(),this.resize()}},r(s,"save_screenshot",function(){this.render();var t=this.renderer.context.gl.canvas,e=t.toDataURL("image/jpeg");if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){var i=new Date,r=i.getFullYear()+"-"+i.getMonth()+"-"+i.getDate()+"_"+i.getHours()+"."+i.getMinutes()+"."+i.getSeconds(),s=document.createElement("a");s.href=e,s.download="pitchblack_"+r+".jpg",s.click()}else window.open(e)}),r(s,"set_quality",function(t){this.scaling=4-t,this.resize()}),r(s,"draw",function(){this.video&&this.video.readyState===this.video.HAVE_ENOUGH_DATA&&(this.texture.update(),this.rawFBO.bind(),this.renderer.render(this.root,this.camera),this.thresoldFBO.bind(),this.thresold.shader.use(),this.thresold.shader.setUniform("THRESHOLD",this.params.threshold),this.thresold.shader.setUniform("SOFT",this.params.soft),this.thresold.shader.setUniform("INVERT",this.params.invert),this.thresold.shader.setUniform("uTexture",this.rawFBO.texture),this.renderer.render(this.thresold),this.renderer.renderToScreen(),this.renderer.context.gl.viewport(0,0,this.renderer.context.canvas.width,this.renderer.context.canvas.height),this.post.shader.use(),this.post.shader.setUniform("WEIGHT",this.params.weight),this.post.shader.setUniform("DECAY_FACTOR",this.params.decay),this.post.shader.setUniform("DENSITY",this.params.density),this.post.shader.setUniform("uTexture",this.thresoldFBO.texture),this.renderer.render(this.post))}),r(s,"render",function(t){if(t<this.lastFrameTimeMs+20)return void requestAnimationFrame(this.render);this.lastFrameTimeMs=t,this.draw(),requestAnimationFrame(this.render)}),r(s,"resize",function(t){if(this.video){var e=window.innerWidth,i=window.innerHeight,r=this.video.videoWidth/this.video.videoHeight;console.log(r),i=this.video.videoHeight,e=i*r,this.rawFBO.resize(e/this.scaling,i/this.scaling),this.postFBO.resize(e/this.scaling,i/this.scaling),this.thresoldFBO.resize(e/this.scaling,i/this.scaling),this.renderer.context.size(e/this.scaling,i/this.scaling,window.devicePixelRatio),this.camera.projection=(new SQR.ProjectionMatrix).perspective(70,r,1,1e3)}}),s)})}]);
//# sourceMappingURL=bundle.app.js.map