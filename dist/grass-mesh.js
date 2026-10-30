// One atlas and one draw call for the overlapping, independently bending tufts.
export class GrassMesh{
 constructor(){
  this.canvas=document.createElement('canvas');const gl=this.canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true});if(!gl)throw new Error('WebGL unavailable');this.gl=gl;
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 position;attribute vec2 uv;attribute float opacity;uniform vec2 viewport;varying vec2 texcoord;varying float alpha;void main(){texcoord=uv;alpha=opacity;gl_Position=vec4(position.x/viewport.x*2.0-1.0,1.0-position.y/viewport.y*2.0,0.0,1.0);}'));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D image;varying vec2 texcoord;varying float alpha;void main(){gl_FragColor=texture2D(image,texcoord)*alpha;}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  this.program=program;this.buffer=gl.createBuffer();this.texture=gl.createTexture();this.position=gl.getAttribLocation(program,'position');this.uv=gl.getAttribLocation(program,'uv');this.opacity=gl.getAttribLocation(program,'opacity');this.viewport=gl.getUniformLocation(program,'viewport');this.entries=new Map();this.data=new Float32Array(0);this.lost=false;
  this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true});
 }
 atlas(items){
  const images=[...new Set(items.map(t=>t.image))];if(images.every(im=>this.entries.has(im)))return;
  const gl=this.gl,size=256,pad=2,cols=Math.min(8,Math.max(1,Math.ceil(Math.sqrt(images.length)))),rows=Math.ceil(images.length/cols),atlas=document.createElement('canvas');atlas.width=cols*size;atlas.height=rows*size;if(Math.max(atlas.width,atlas.height)>gl.getParameter(gl.MAX_TEXTURE_SIZE))throw new Error('Grass atlas too large');const g=atlas.getContext('2d');this.entries.clear();
  images.forEach((im,i)=>{const x=i%cols*size+pad,y=Math.floor(i/cols)*size+pad,w=size-2*pad,h=size-2*pad;g.drawImage(im,x,y,w,h);this.entries.set(im,{u:x/atlas.width,v:y/atlas.height,w:w/atlas.width,h:h/atlas.height})});
  gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);
 }
 draw(ctx,items,view,field){
  if(this.lost)throw new Error('Grass context lost');this.atlas(items);
  const gl=this.gl,ratio=Math.min(view.width<=600?1.25:1.5,globalThis.devicePixelRatio||1),w=Math.ceil(view.width*ratio),h=Math.ceil(view.height*ratio);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}
  const floats=items.length*10*6*5;if(this.data.length<floats)this.data=new Float32Array(floats);let cursor=0;
  const vertex=(x,y,u,v,alpha)=>{this.data[cursor++]=x;this.data[cursor++]=y;this.data[cursor++]=u;this.data[cursor++]=v;this.data[cursor++]=alpha};
  for(const {t,p,image,alpha} of items){const uv=this.entries.get(image),slices=10;let a=field.canopyPoint(t,p,1);
   for(let i=0;i<slices;i++){const b=field.canopyPoint(t,p,1-(i+1)/slices),left=a.x-p.w*.5,right=b.x-p.w*.5,u0=uv.u,u1=uv.u+uv.w,v0=uv.v+uv.h*i/slices,v1=uv.v+uv.h*(i+1)/slices;
    vertex(left,a.y,u0,v0,alpha);vertex(left+p.w,a.y,u1,v0,alpha);vertex(right,b.y,u0,v1,alpha);vertex(left+p.w,a.y,u1,v0,alpha);vertex(right+p.w,b.y,u1,v1,alpha);vertex(right,b.y,u0,v1,alpha);a=b;
   }
  }
  gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,this.data.subarray(0,cursor),gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(this.position);gl.vertexAttribPointer(this.position,2,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(this.uv);gl.vertexAttribPointer(this.uv,2,gl.FLOAT,false,20,8);gl.enableVertexAttribArray(this.opacity);gl.vertexAttribPointer(this.opacity,1,gl.FLOAT,false,20,16);gl.uniform2f(this.viewport,view.width,view.height);gl.drawArrays(gl.TRIANGLES,0,cursor/5);gl.flush();ctx.drawImage(this.canvas,0,0,view.width,view.height);
 }
 drawSprites(ctx,items,width,height){
  if(this.lost)throw new Error('Sprite context lost');this.atlas(items);const gl=this.gl;
  if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height}
  const needed=items.length*30;if(this.data.length<needed)this.data=new Float32Array(needed);let cursor=0;
  for(const item of items){const uv=this.entries.get(item.image);for(const i of [0,1,2,1,3,2]){const p=item.points[i];this.data[cursor++]=p.x;this.data[cursor++]=p.y;this.data[cursor++]=uv.u+(i%2)*uv.w;this.data[cursor++]=uv.v+(i>1?1:0)*uv.h;this.data[cursor++]=item.alpha}}
  gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,this.data.subarray(0,cursor),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(this.position);gl.vertexAttribPointer(this.position,2,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(this.uv);gl.vertexAttribPointer(this.uv,2,gl.FLOAT,false,20,8);gl.enableVertexAttribArray(this.opacity);gl.vertexAttribPointer(this.opacity,1,gl.FLOAT,false,20,16);gl.uniform2f(this.viewport,width,height);gl.drawArrays(gl.TRIANGLES,0,cursor/5);gl.flush();ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.drawImage(this.canvas,0,0);ctx.restore();
 }
 dispose(){this.gl.getExtension('WEBGL_lose_context')?.loseContext();this.entries.clear()}
}
