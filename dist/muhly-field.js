// Continuous grass canopy. Wind travels through ground space; roots stay fixed.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>t*t*(3-2*t);
function randomSource(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function hash(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)}
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),a=smooth(x-ix),b=smooth(y-iy);return (hash(ix,iy)*(1-a)+hash(ix+1,iy)*a)*(1-b)+(hash(ix,iy+1)*(1-a)+hash(ix+1,iy+1)*a)*b}

export class MuhlyField{
 constructor({ambient=true}={}){this.kind='muhly';this.ambient=ambient;this.reduced=false;this.reset()}
 reset(){
  const random=randomSource(251025);this.time=0;this.backdrop=null;this.wind=[];this.seeds=[];this.branches=[];this.petals=[];this.seedBudget=0;
  this.sweptLayers=[[.30,.35,.94,.18,.95,.52],[.76,.405,.89,.30,.82,.63],[.23,.49,.66,.40,1.18,.71],[.68,.555,1.02,.64,.93,.81],[.43,.635,.62,.87,1.30,.91]].map(spec=>({spec,cols:13,rows:4,nodes:Array.from({length:52},(_,i)=>({col:i%13,row:Math.floor(i/13),bend:0,velocity:0,head:0,touch:0,touchUntil:0,stiffness:3.4+hash(i,spec[3])*1.0}))}));
  this.tufts=[];
  // Fixed, overlapping density pockets: coherent masses with open seams, not rows.
  const pockets=[[.27,.24,.22,.25],[.63,.39,.27,.24],[.43,.76,.29,.22]];
  while(this.tufts.length<360){
   const u=random(),z=random(),density=pockets.reduce((sum,[x,y,sx,sy])=>sum+Math.exp(-(((u-x)/sx)**2+((z-y)/sy)**2)*1.4),0);
   if(random()>Math.min(.94,.1+density*.76))continue;
   const local=noise(u*3.8+8,z*3.1+2),size=(92+z*245)*(.64+local*.54+random()*.25);
   this.tufts.push({id:this.tufts.length,x:u*900,z,
    rootY:280+z*745,state:'attached',size,width:.72+local*.38+random()*.22,
    rootOffset:random()*.035,rest:(local-.5)*.2+(random()-.5)*.13,
    bend:0,velocity:0,head:0,frequency:3.8+random()*1.8,
    damping:.66+random()*.16,phase:random()*Math.PI*2,sprite:random()<.5?0:1,
    tone:Math.floor(random()*4),alpha:.53+local*.25+random()*.15});
  }
  // Uneven banks vary at several scales; remove whole tufts, never clip the texture.
  this.tufts=this.tufts.filter(t=>{const u=t.x/900,z=t.z;
   const left=.025+.18*Math.exp(-(((z-.32)/.105)**2))+.12*Math.exp(-(((z-.69)/.085)**2))+.045*noise(z*17,2);
   const right=.97-.15*Math.exp(-(((z-.48)/.10)**2))-.09*Math.exp(-(((z-.86)/.07)**2))-.04*noise(z*19,6);
   return u>left&&u<right;
  });
  // Remove the foreground right lobe at the planting level, leaving scattered natural tips.
  this.tufts=this.tufts.filter(t=>!(t.z>.70+.10*noise(t.x*.013,4)&&this.ribbonX(t.x/900,t.z)>.23+.055*noise(t.z*11,7)));
  // A loose foreground fringe reconnects the lower-left hollow.
  const fringeSource=[...this.tufts];
  for(let i=0;i<22;i++){
   const u=.25+random()*.37,z=.955+random()*.045,source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push({...source,id:360+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(.66+random()*.24),width:.66+random()*.24,
    rootOffset:random()*.035,alpha:.59+random()*.22,phase:random()*Math.PI*2});
  }
  // Local extensions at the two screen crossings keep the banks loose.
  for(let i=0;i<34;i++){
   const upper=i<17,z=upper?.025+random()*.085:.975+random()*.025;
   const u=upper?.035+random()*.27:.37+random()*.12;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push({...source,id:400+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(upper?1.18+random()*.43:.59+random()*.22),
    width:.63+random()*.23,rootOffset:upper?random()*.02:-.035-random()*.045,
    alpha:.54+random()*.24,phase:random()*Math.PI*2});
  }
  // An off-centre pocket interrupts the long upper bank without forming a separate mound.
  for(let i=0;i<46;i++){
   const z=.40+random()*.20,u=.025+random()*.26;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push({...source,id:450+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(1.30+.78*Math.exp(-(((z-.49)/.075)**2))+random()*.26),width:.68+random()*.29,
    rootOffset:random()*.025,alpha:.57+random()*.23,phase:random()*Math.PI*2});
  }
  // Taller, interlocking tufts carry the upper bank into the left corner.
  for(let i=0;i<48;i++){
   const z=.62+random()*.19,u=.04+random()*.23;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push({...source,id:500+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*([1.65,2.12,2.62][i%3]+random()*.25),width:.65+random()*.32,
    rootOffset:random()*.025,alpha:.55+random()*.24,phase:random()*Math.PI*2});
  }
  // A tapering foreground pocket fills the lower-right while keeping an uneven bank.
  for(let i=0;i<33;i++){
   const z=.80+random()*.17,u=.66+random()*.18;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push({...source,id:600+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(.68+random()*.30),width:.63+random()*.27,
    rootOffset:.025+random()*.065,alpha:.55+random()*.26,phase:random()*Math.PI*2});
  }
  // Lower-right infill follows the raised meadow, with staggered root depths.
  for(let i=0;i<24;i++){
   const z=.92+random()*.075,u=.72+random()*.16;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push({...source,id:650+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(1.18+random()*.48),width:.65+random()*.28,
    rootOffset:.005+random()*.055,alpha:.58+random()*.23,phase:random()*Math.PI*2});
  }
  // Short foreground blooms bridge the hollow below the softened stems.
  for(let i=0;i<34;i++){
   const u=.43+random()*.43,z=.92+random()*.075;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push({...source,id:700+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(.66+.31*noise(u*19,5)+random()*.22),width:.57+random()*.24,
    rootOffset:.01+.06*noise(u*13,8)+random()*.02,
    alpha:.60+random()*.23,phase:random()*Math.PI*2});
  }
  // Extend the marked lower bank with long overlapping plumes, not separate short bunches.
  for(let i=0;i<28;i++){
   const u=.57+random()*.34,z=.955+random()*.04;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push({...source,id:750+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(1.06+random()*.35),width:.62+random()*.24,
    rootOffset:-.015+random()*.04,fringeDrop:.09+random()*.055,lowerShift:.032,
    alpha:.57+random()*.23,phase:random()*Math.PI*2});
  }
  // Fill the marked upper saddle with interlocking tall and medium plumes.
  for(let i=0;i<25;i++){
   const z=.20+random()*.15,u=.035+random()*.29,source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push({...source,id:800+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(1.48+random()*.55),width:.66+random()*.27,
    rootOffset:random()*.025,alpha:.56+random()*.25,phase:random()*Math.PI*2});
  }
  // Long foreground sprays overlap the lower-right edge rather than hang as short bunches.
  for(let i=0;i<20;i++){
   const z=.965+random()*.03,u=.73+random()*.17,source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push({...source,id:850+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(.99+random()*.35),width:.63+random()*.26,
    rootOffset:.045+random()*.035,fringeDrop:.07+random()*.025,lowerShift:.045,
    alpha:.57+random()*.23,phase:random()*Math.PI*2});
  }
  this.tufts.sort((a,b)=>a.z-b.z);Object.assign(this.tufts.at(-1),{z:1,rootOffset:0});for(const t of this.tufts)t.y=t.rootY-t.size*.65;this.leaves=this.tufts;
  const accents=[[-.46,.96],[-.30,.95],[-.12,.96],[.05,.91],[.21,.82],[.36,.69],[.47,.58],[.30,.30]];
  for(const [x,z] of accents){const tuft=this.tufts.filter(t=>!t.foliage).reduce((best,t)=>{const score=(this.ribbonX(t.x/900,t.z)-x)**2+(t.z-z)**2*2;return !best||score<best.score?{t,score}:best},null);if(tuft)tuft.t.foliage=true}
  this.tufts=this.tufts.filter(t=>t.foliage||t.z>.9||t.id%9!==4);this.leaves=this.tufts;
  const design=this.layout(390,844,615);
  for(const [x,y] of [[.24,.43],[.58,.35],[.76,.52],[.42,.60],[.64,.66]]){
   const nearest=this.tufts.filter(t=>!t.verdant).reduce((best,t)=>{const p=this.project(t,design),d=((p.x/390-x)*1.2)**2+( (p.root-p.h*.27)/844-y)**2;return !best||d<best.d?{t,d}:best},null);
   if(nearest)nearest.t.verdant=true;
  }
 }
 setReduced(value){this.reduced=value;if(value){this.wind=[];this.seeds=[];for(const t of this.tufts)t.bend=t.velocity=t.head=0;for(const layer of this.sweptLayers)for(const node of layer.nodes)node.bend=node.velocity=node.head=node.touch=0}}
 beginGesture(){this.seedBudget=4;this.gestureVX=this.gestureVY=0}
 brush(a,b){/* Muhly stays a rooted flower haze; brushing does not spawn floating particles. */}

 emit(a,b,v){
  if(this.reduced||b.inside===false||Math.hypot(v.x,v.y)<20)return;
  const last=this.wind[this.wind.length-1],strength=clamp(Math.hypot(v.x,v.y)/1450,.12,.85),direction=v.x<0?-1:1;
  if(last&&!last.broad&&this.time-last.born<.1&&Math.abs(last.x-b.x)<150){last.strength=Math.max(last.strength,strength);return}
  this.wind.push({x:b.x,z:clamp((b.y-185)/500,0,1),speed:direction*(185+strength*110),width:95+strength*70,strength:direction*strength,born:this.time,life:3.4,broad:false});
  if(this.wind.length>12)this.wind.shift();
 }
 breeze(){if(!this.reduced)this.wind.push({x:-300,z:.5,speed:245,width:180,strength:1.05,born:this.time,life:6.8,broad:true});if(this.wind.length>12)this.wind.shift()}
 sampleWind(x,z){
  const t=this.time;
  const drift=noise(x*.0034-t*.48,z*2.4);
  let value=this.ambient?.1+.42*smooth(clamp((drift-.28)/.55,0,1))+.06*noise(x*.008-t*.17,z*4.1):0;
  for(const g of this.wind){const age=t-g.born,center=g.x+g.speed*age+z*(g.broad?115:45),distance=(x-center)/g.width,across=g.broad?1:Math.exp(-(((z-g.z)/.22)**2)),fade=1-smooth(clamp((age-g.life+.8)/.8,0,1));value+=g.strength*Math.exp(-distance*distance*2)*across*fade}
  return clamp(value,-1.3,1.5);
 }
 step(h=1/60){
  this.time+=h;this.wind=this.wind.filter(g=>this.time-g.born<g.life);if(this.reduced)return;
  if(!this.sweptImage)for(const t of this.tufts){
   const local=this.sampleWind(t.x,t.z),detail=this.ambient?.012*Math.sin(this.time*2.6+t.phase):0,target=local*.27+detail;
   const w=t.frequency;t.velocity+=(w*w*(target-t.bend)-2*t.damping*w*t.velocity)*h;t.bend=clamp(t.bend+t.velocity*h,-.5,.55);
   t.head+=(t.bend-t.head)*(1-Math.exp(-h*6));
  }
  for(const layer of this.sweptLayers){
   const rect=this.viewport?this.sweptRect(layer,this.viewport):null;
   for(const node of layer.nodes){
    if(node.row===layer.rows-1){node.bend=node.velocity=node.head=node.touch=0;continue}
    const u=node.col/(layer.cols-1),v=node.row/(layer.rows-1),x=rect?(rect.x+rect.w*u)/this.viewport.width*900:u*900;
    const local=this.sampleWind(x,clamp(layer.spec[3]+(v-.5)*.14,0,1));
    const breeze=this.ambient?.045*Math.sin(this.time*.85-x*.007+layer.spec[3]*3)+.018*(noise(x*.011-this.time*.35,layer.spec[3]*4)-.5):0;
    node.touch*=Math.exp(-h*(this.time<node.touchUntil?0:12));
    const target=(local*.30+breeze)*(1-v)**1.55+node.touch,w=node.stiffness+4*smooth(clamp(Math.abs(node.touch)/.25,0,1));
    node.velocity+=(w*w*(target-node.bend)-1.35*w*node.velocity)*h;
    node.bend=clamp(node.bend+node.velocity*h,-.80,.80);
    node.head+=(node.bend-node.head)*(1-Math.exp(-h*12));
   }
  }
  for(const p of this.seeds){p.age+=h;p.x+=p.vx*h;p.y+=p.vy*h;p.vy+=12*h;p.vx+=Math.sin(this.time*2+p.phase)*h*5}
  this.seeds=this.seeds.filter(p=>p.age<4);
 }
 shedAmbient(){return false}
 get remaining(){return this.tufts.length}
 get active(){return !this.reduced}
 layout(width,height,groundY){
  const portrait=width<=600&&height>width;
  return {width,height,centerX:width/2,groundY:(groundY??height*(portrait?.73:.83))-height*.035,patchWidth:(portrait?width:Math.min(width*.92,height*1.5))*.96,patchHeight:height*.525};
 }
 ribbonX(u,z){
  const span=(.43+.13*z)*(1+.16*Math.sin(z*13+.6)+.09*Math.sin(z*25)),drift=.72-1.48*z+.065*Math.sin(z*5.4+.4)+.035*Math.sin(z*17+.7);
  const spread=1.08*smooth(clamp((z-.23)/.68,0,1));
  return (u-.5)*span+drift+spread*u**1.12;
 }
 project(t,view){
  const wave=Math.sin(t.z*17+t.x*.004+noise(t.x*.003,3)*1.5);
  const lateral=this.ribbonX(t.x/900,t.z);
  const upperNotch=1-.24*Math.exp(-(((lateral-.14)/.17)**2));
  const variation=t.size/(92+t.z*245)*(.94+.13*wave)*upperNotch;
  const edge=.91+.12*noise(t.x*.004+3,t.z*3);
  const baseRoot=Math.min(view.groundY+view.height*.06,view.groundY-view.patchHeight*(.95*(1-t.z)-.07+(t.rootOffset||0)));
  const room=Math.max(0,view.height-(view.width<=600?170:125)-baseRoot);
  const rightRise=view.patchHeight*.13*smooth(clamp((lateral+.02)/.48,0,1))*smooth(clamp((t.z-.72)/.25,0,1));
  const root=baseRoot+(room>0?room*(1-Math.exp(-view.patchHeight*(t.fringeDrop||0)/room)):0)+view.height*(t.lowerShift||0)-rightRise;
  return {x:view.centerX+this.ribbonX(t.x/900,t.z)*view.patchWidth,root,h:view.patchHeight*(.17+.22*t.z)*variation*edge,w:view.patchWidth*(.15+.15*t.z)*t.width};
 }
 touchProject(t,view){const p=this.project(t,view);if(this.sweptImage){p.h=Math.min(p.h,view.height*(.10+.065*t.z));p.w*=1.15}return p}
 fromScreen(x,y,width,height,groundY){
  const view=this.layout(width,height,groundY);this.viewport=view;
  if(this.sweptImage){const layer=this.frontLayer(x,y,view);return {x:x/width*900,y:185+(layer?.spec[3]??.5)*500,sx:x,sy:y,inside:!!layer}}
  let closest=null,score=Infinity;
  for(const t of this.tufts){const p=this.touchProject(t,view),dx=(x-p.x)/Math.max(12,p.w*.45),dy=(y-(p.root-p.h*.55))/Math.max(15,p.h*.57),d=dx*dx+dy*dy;if(d<score){score=d;closest=t}}
  return {x:closest.x,y:185+closest.z*500,sx:x,sy:y,inside:score<1.5||this.sweptHit(x,y,view)};
 }
 drag(a,b,velocity){
  if(this.reduced||!this.viewport||b.inside===false)return;
  const view=this.viewport,ax=a.sx??b.sx,ay=a.sy??b.sy,dx=b.sx-ax,dy=b.sy-ay,length2=dx*dx+dy*dy;
  if(!Number.isFinite(length2)||length2<.2)return;
  const dt=Number.isFinite(a.t)&&Number.isFinite(b.t)?clamp((b.t-a.t)/1000,.008,.08):1/30;
  const vx=Number.isFinite(a.t)&&Number.isFinite(b.t)?dx/dt:(velocity?.x??dx*30),vy=Number.isFinite(a.t)&&Number.isFinite(b.t)?dy/dt:(velocity?.y??dy*30);
  const blend=1-Math.exp(-dt/.025);this.gestureVX=(this.gestureVX||0)+(vx-(this.gestureVX||0))*blend;this.gestureVY=(this.gestureVY||0)+(vy-(this.gestureVY||0))*blend;
  const drive=Math.tanh((this.gestureVX+this.gestureVY*.18)/380)*.80;
  const front=this.frontLayer(b.sx,b.sy,view);
  if(this.sweptImage)for(const layer of this.sweptLayers){
   if(layer!==front)continue;
   const p=this.sweptRect(layer,view);
   for(const node of layer.nodes){
    if(node.row===layer.rows-1)continue;
    const x=p.x+p.w*node.col/(layer.cols-1),y=p.y+p.h*node.row/(layer.rows-1);
    const along=clamp(((x-ax)*dx+(y-ay)*dy)/length2,0,1);
    const distance=Math.hypot(x-ax-dx*along,y-ay-dy*along),radius=38;
    const weight=smooth(clamp(1-distance/radius,0,1));
    if(weight){node.touch=drive*weight;node.touchUntil=this.time+.18}
   }
  }
  if(this.sweptImage)return;
  for(const t of this.tufts){const p=this.touchProject(t,view),px=p.x+(t.rest+t.head)*p.h*.6,py=p.root-p.h*.60;
   const along=length2?clamp(((px-ax)*dx+(py-ay)*dy)/length2,0,1):0;
   const distance=Math.hypot(px-ax-dx*along,py-ay-dy*along),radius=Math.max(20,Math.min(34,p.h*.30));
   if(distance>radius)continue;const weight=(1-distance/radius)**2;
   t.bend=clamp(t.bend+drive*.25*weight,-.5,.55);t.velocity=clamp(t.velocity+drive*2*weight,-1.5,1.5);
  }
 }

 canopyWeight(t){return (.80+.20*noise(t.x*.009+4,t.z*5))*(.82+.18*t.z)}
 textureForScene(image,t,p,view,scene){
  if(scene!=='moon')return image;
  if(!this.moonTextures)this.moonTextures=new WeakMap();let tones=this.moonTextures.get(image);if(!tones){tones=[];this.moonTextures.set(image,tones)}
  const exposure=clamp(.58*(1-p.x/view.width)+.42*(1-t.z),0,1),level=Math.min(2,Math.floor(exposure*3));if(tones[level])return tones[level];
  const c=document.createElement('canvas'),ratio=Math.min(1,256/Math.max(image.width,image.height));c.width=Math.max(1,Math.round(image.width*ratio));c.height=Math.max(1,Math.round(image.height*ratio));const g=c.getContext('2d');g.filter=`brightness(${.76+level*.10})`;g.drawImage(image,0,0,c.width,c.height);tones[level]=c;return c;
 }

 sweptRect(layer,view){
  const [cx,cy,span,,tall]=layer.spec,w=view.width*span,h=w*(this.sweptImage?this.sweptImage.height/this.sweptImage.width:.4)*tall;
  return {x:cx*view.width-w/2,y:cy*view.height-h/2,w,h};
 }
 frontLayer(x,y,view){
  if(!this.sweptImage)return null;
  for(let i=this.sweptLayers.length-1;i>=0;i--){const layer=this.sweptLayers[i],p=this.sweptRect(layer,view),u=(x-p.x)/p.w,v=(y-p.y)/p.h;
   if(u<.02||u>.98||v<.05||v>.88)continue;
   if(this.sweptImage.hitAlpha){const mask=this.sweptImage.hitAlpha,col=Math.min(mask.width-1,Math.floor(u*mask.width)),row=Math.min(mask.height-1,Math.floor(v*mask.height));if(mask.data[row*mask.width+col]<22)continue}
   return layer;
  }return null;
 }
 sweptHit(x,y,view){return !!this.frontLayer(x,y,view)}
 dispose(){const gl=this.meshRenderer?.gl;if(gl)gl.getExtension('WEBGL_lose_context')?.loseContext();this.meshRenderer=null}
 // Rasterize shared mesh edges once, avoiding Canvas clip seams on translucent grass.
 drawSweptMesh(target,image,layer,p,view,pass={first:true,last:true}){
  if(this.meshUnavailable)return false;
  if(!this.meshRenderer){
   const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,preserveDrawingBuffer:true});
   if(!gl){this.meshUnavailable=true;return false}
   const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
   try{
    const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 position;attribute vec2 uv;uniform vec2 viewport;varying vec2 texcoord;void main(){texcoord=uv;gl_Position=vec4(position.x/viewport.x*2.0-1.0,1.0-position.y/viewport.y*2.0,0.0,1.0);}'));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 texcoord;uniform sampler2D image;uniform float opacity;void main(){gl_FragColor=texture2D(image,texcoord)*opacity;}'));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    this.meshRenderer={canvas,gl,program,buffer:gl.createBuffer(),position:gl.getAttribLocation(program,'position'),uv:gl.getAttribLocation(program,'uv'),viewport:gl.getUniformLocation(program,'viewport'),opacity:gl.getUniformLocation(program,'opacity'),textures:new WeakMap()};
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.meshUnavailable=true});
   }catch(e){this.meshUnavailable=true;return false}
  }
  const r=this.meshRenderer,{gl,canvas}=r,ratio=Math.min(1.5,globalThis.devicePixelRatio||1),cw=Math.ceil(view.width*ratio),ch=Math.ceil(view.height*ratio);
  if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}
  gl.viewport(0,0,cw,ch);if(pass.first){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)}gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(r.program);gl.uniform1f(r.opacity,layer.spec[5]);
  let texture=r.textures.get(image);if(!texture){texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);r.textures.set(image,texture)}else gl.bindTexture(gl.TEXTURE_2D,texture);
  const vertices=[];
  const vertex=(col,row)=>{const node=layer.nodes[row*layer.cols+col],u=col/(layer.cols-1),v=row/(layer.rows-1),bend=node.head;vertices.push(p.x+p.w*u+bend*Math.min(p.h*.55,p.w/(layer.cols-1)*1.75),p.y+p.h*v+Math.abs(bend)*p.h*.09,u,v)};
  for(let row=0;row<layer.rows-1;row++)for(let col=0;col<layer.cols-1;col++){vertex(col,row);vertex(col+1,row);vertex(col,row+1);vertex(col+1,row);vertex(col+1,row+1);vertex(col,row+1)}
  gl.bindBuffer(gl.ARRAY_BUFFER,r.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(r.position);gl.vertexAttribPointer(r.position,2,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(r.uv);gl.vertexAttribPointer(r.uv,2,gl.FLOAT,false,16,8);gl.uniform2f(r.viewport,view.width,view.height);gl.drawArrays(gl.TRIANGLES,0,vertices.length/4);if(pass.last)gl.flush();
  if(pass.last){target.save();target.globalAlpha=1;target.drawImage(canvas,0,0,view.width,view.height);target.restore()}return true;
 }
 drawSwept(ctx,layer,view,scene){
  const p=this.sweptRect(layer,view),nodes=layer.nodes,image=this.textureForScene(this.sweptImage,{z:layer.spec[3]},{x:p.x+p.w/2},view,scene);
  ctx.save();ctx.globalAlpha=layer.spec[5];
  if(this.reduced||nodes.every(n=>Math.abs(n.bend)<.003)){ctx.drawImage(image,p.x,p.y,p.w,p.h);ctx.restore();return}
  const target=ctx;target.restore();
  if(this.drawSweptMesh(target,image,layer,p,view))return;
  if(!this.warpCanvas)this.warpCanvas=document.createElement('canvas');
  const ratio=Math.min(2,globalThis.devicePixelRatio||1),cw=Math.ceil(view.width*ratio),ch=Math.ceil(view.height*ratio);
  if(this.warpCanvas.width!==cw||this.warpCanvas.height!==ch){this.warpCanvas.width=cw;this.warpCanvas.height=ch}
  ctx=this.warpCanvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cw,ch);ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='lighter';
  // Shared antialiased edges add their complementary coverage once on the isolated layer.
  for(let row=0;row<layer.rows-1;row++)for(let col=0;col<layer.cols-1;col++){
   const sw=image.width/(layer.cols-1),sh=image.height/(layer.rows-1),sx=col*sw,sy=row*sh;
   const point=(c,r)=>{const n=nodes[r*layer.cols+c],bend=this.reduced?0:n.head;
    return [p.x+p.w*c/(layer.cols-1)+bend*Math.min(p.h*.55,p.w/(layer.cols-1)*1.75),p.y+p.h*r/(layer.rows-1)+Math.abs(bend)*p.h*.09];
   };
   const p00=point(col,row),p10=point(col+1,row),p01=point(col,row+1),p11=point(col+1,row+1);
   const triangles=[[[0,0],[sw,0],[0,sh],[p00,p10,p01]],[[sw,0],[sw,sh],[0,sh],[p10,p11,p01]]];
   for(const [s0,s1,s2,d] of triangles){
    const det=(s1[0]-s0[0])*(s2[1]-s0[1])-(s2[0]-s0[0])*(s1[1]-s0[1]);
    const aa=((d[1][0]-d[0][0])*(s2[1]-s0[1])-(d[2][0]-d[0][0])*(s1[1]-s0[1]))/det;
    const bb=((d[1][1]-d[0][1])*(s2[1]-s0[1])-(d[2][1]-d[0][1])*(s1[1]-s0[1]))/det;
    const cc=((s1[0]-s0[0])*(d[2][0]-d[0][0])-(s2[0]-s0[0])*(d[1][0]-d[0][0]))/det;
    const dd=((s1[0]-s0[0])*(d[2][1]-d[0][1])-(s2[0]-s0[0])*(d[1][1]-d[0][1]))/det;
    ctx.save();ctx.beginPath();ctx.moveTo(...d[0]);ctx.lineTo(...d[1]);ctx.lineTo(...d[2]);ctx.closePath();ctx.clip();
    ctx.transform(aa,bb,cc,dd,d[0][0]-aa*s0[0]-cc*s0[1],d[0][1]-bb*s0[0]-dd*s0[1]);
    ctx.drawImage(image,-sx,-sy);ctx.restore();
   }
  }ctx.restore();
  target.save();target.globalAlpha=layer.spec[5];target.drawImage(this.warpCanvas,0,0,cw,ch,0,0,view.width,view.height);target.restore();
 }
 drawFoliage(ctx,t,x,root,h,front){
  ctx.save();ctx.lineCap='round';
  const colors=['#879580','#9b9e7c','#b0a68c','#82958b'];
  for(let i=0;i<(front?7:12);i++){
   const r=hash(t.id*3+i,front?9:4),side=hash(i+17,t.id)*2-1;
   const reach=h*(front?.24:.30)*( .65+r*.85),base=x+side*h*.085;
   const sway=(this.reduced?0:t.bend)*reach*.85;
   const tipX=base+side*reach*(.35+hash(t.id,i)*.65)+sway;
   const tipY=root-reach*(.65+hash(i,t.id+2)*.35);
   ctx.strokeStyle=colors[(i+t.tone)%colors.length];ctx.globalAlpha=(front?.24:.18)*this.canopyWeight(t);
   ctx.lineWidth=(front?.85:.65)*( .7+r*.5);
   ctx.beginPath();ctx.moveTo(base,root-h*(.055+hash(t.id,i+21)*.045));
   ctx.bezierCurveTo(base+side*reach*.12,root-reach*.48,tipX-side*reach*.18,tipY-reach*.16,tipX,tipY);ctx.stroke();
  }
  ctx.restore();
 }
 drawGreenPocket(ctx,t,p){
  const image=this.greenPocket;if(!image)return;
  const height=Math.min(54,p.h*.26),width=height*1.5,base=p.root-p.h*.12;
  ctx.save();ctx.globalAlpha=.34;
  for(let i=0;i<5;i++){
   const v=i/5,u=1-v,sway=(this.reduced?0:t.bend)*height*u*u;
   ctx.drawImage(image,0,image.height*v,image.width,image.height/5,p.x-width/2+sway,base-height+height*v,width,height/5+.25);
  }
  ctx.restore();
 }

 drawBackdrop(ctx,view,textures,scene){
  const {width,height}=view;
  // Ground shading follows the ribbon instead of forming a floating oval.
  for(let i=0;i<20;i++){
   const z=i/19,p=this.project({x:450,z,size:92+z*245,width:1},view);
   ctx.save();ctx.translate(p.x,p.root+3);ctx.scale(1,.18);
   const radius=view.patchWidth*(.09+.06*z),shadow=ctx.createRadialGradient(0,0,0,0,0,radius);
   shadow.addColorStop(0,'rgba(85,98,74,.026)');shadow.addColorStop(1,'rgba(85,98,74,0)');ctx.fillStyle=shadow;ctx.fillRect(-radius,-radius,radius*2,radius*2);ctx.restore();
  }
  for(const t of this.tufts){
   const p=this.project(t,view);if(textures.swept){p.h=Math.min(p.h,height*(.10+.065*t.z));p.w*=1.15}const {x,root,h,w}=p,source=textures[t.sprite*4+t.tone]||textures[t.tone];if(!source)continue;const image=this.textureForScene(source,t,p,view,scene);
   const bend=t.rest+(textures.swept?0:t.bend),tip=t.rest+(textures.swept?0:t.head),drop=Math.min(.15,bend*bend*.28),drawH=h*(1-drop),top=root-drawH;
   if(t.verdant)this.drawGreenPocket(ctx,t,{x,root,h,w});
   if(t.foliage)this.drawFoliage(ctx,t,x,root,h,false);
   ctx.globalAlpha=t.alpha*this.canopyWeight(t)*(.84+.16*smooth(t.z))*(.96+.04*Math.cos(bend*3));
   if(textures.swept)ctx.globalAlpha*=.42;
   // Piecewise affine bending: strip boundaries meet, and the base stays pinned.
   const slices=t.z<.25?4:6,sourceH=image.height/slices;
   for(let i=0;i<slices;i++){
    const v0=i/slices,v1=(i+1)/slices,u0=1-v0,u1=1-v1;
    const offset=u=>h*(bend*u*u+(tip-bend)*u**5);
    const d0=offset(u0),d1=offset(u1),sliceH=drawH/slices;
    ctx.save();ctx.transform(1,0,(d1-d0)/sliceH,1,x-w*.5+d0,top+v0*drawH);
    ctx.drawImage(image,0,i*sourceH,image.width,sourceH,0,0,w,sliceH+.35);ctx.restore();
   }
   ctx.globalAlpha=1;

  }
 }
 draw(ctx,width,height,textures,groundY,scene='day'){
  const view=this.layout(width,height,groundY);this.viewport=view;this.greenPocket=textures.greenPocket;this.sweptImage=textures.swept;
  if(textures.swept){
   const ratio=Math.min(1.5,globalThis.devicePixelRatio||1),key=[width,height,view.groundY,scene,ratio].join(':');
   if(!this.backdrop||this.backdrop.key!==key||this.backdrop.textures!==textures){
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(width*ratio);canvas.height=Math.ceil(height*ratio);const g=canvas.getContext('2d');g.scale(ratio,ratio);
    this.drawBackdrop(g,view,textures,scene);this.backdrop={key,textures,canvas};
   }
   ctx.drawImage(this.backdrop.canvas,0,0,width,height);
  }else this.drawBackdrop(ctx,view,textures,scene);
  if(textures.swept){
   let batched=!this.reduced;
   if(batched)for(let i=0;i<this.sweptLayers.length;i++){
    const layer=this.sweptLayers[i],p=this.sweptRect(layer,view),image=this.textureForScene(this.sweptImage,{z:layer.spec[3]},{x:p.x+p.w/2},view,scene);
    if(!this.drawSweptMesh(ctx,image,layer,p,view,{first:i===0,last:i===this.sweptLayers.length-1})){batched=false;break}
   }
   if(!batched)for(const layer of this.sweptLayers)this.drawSwept(ctx,layer,view,scene);
  }
  for(const t of this.tufts.filter(t=>t.foliage)){const {x,root,h}=this.project(t,view);this.drawFoliage(ctx,t,x,root,h,true)}
  for(const p of this.seeds){const anchor=this.project({x:p.x,z:clamp((p.y-185)/500,0,1),size:92+clamp((p.y-185)/500,0,1)*245,width:1},view);ctx.globalAlpha=Math.min(1,(4-p.age)*.6)*.6;ctx.fillStyle='#ac718b';ctx.beginPath();ctx.ellipse(anchor.x,anchor.root-anchor.h*.6,1.5,.65,.5,0,Math.PI*2);ctx.fill()}
  ctx.globalAlpha=1;
 }
}
