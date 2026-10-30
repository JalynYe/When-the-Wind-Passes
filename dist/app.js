import {GrassMesh} from './grass-mesh.js?v=20261030willowbatch';
import {SwipeHint} from './swipe-hint.js?v=20261028hint';
import {Fireflies} from './fireflies.js?v=20261028flies';
import {MoonScene} from './moon.js?v=20261030willowclear';
import {BranchInstrument} from './branch-instrument.js?v=20261029grassnotes';
import {LeafWater} from './leaf-water.js?v=20261025rainfall';
import {RainScene} from './rain.js?v=20261030iosbackground';
import {Study,STEP} from './simulation.js?v=20261030jacarandastem';
import {MuhlyField} from './muhly-field.js?v=20261030screeninput';
import {NeedleGrassField} from './needle-grass.js?v=20261030batch';
const isGrass=()=>species==='muhly'||species==='needle';
const makeSimulation=kind=>kind==='needle'?new NeedleGrassField():kind==='muhly'?new MuhlyField():new Study(kind);
import {WindAudio} from './audio.js?v=20261028sceneaudio';
const canvas=document.querySelector('#scene');let ctx=canvas.getContext('2d');const displayCtx=ctx,plantCanvas=document.createElement('canvas'),plantCtx=plantCanvas.getContext('2d');let species='maple',sim=makeSimulation(species);const audio=new WindAudio();document.querySelector('main').dataset.species=species;
let hintStorage;try{hintStorage=localStorage}catch{}const swipeHint=new SwipeHint(hintStorage);const fireflies=new Fireflies();const moon=new MoonScene();let moonlit=false;const instrument=new BranchInstrument();const water=new LeafWater();const rain=new RainScene();let rainy=false;
const sprites=await Promise.all([1,4,7,11,18].map(i=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=`assets/leaf-${String(i).padStart(2,'0')}.png`})));
// Pre-tinted leaf variants preserve texture and alpha without per-frame filters.
const leafTones=sprites.map(im=>{if(!im)return[];return ['rgba(118,133,66,.40)','rgba(236,194,72,.48)','rgba(231,150,52,.57)','rgba(210,104,40,.67)','rgba(172,65,44,.73)'].map(color=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,c.width,c.height);return c})});
function tinted(im,color){if(!im)return null;const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,c.width,c.height);return c}
const wetSprites=new WeakMap();
function wetImage(im){if(!im)return im;if(!wetSprites.has(im))wetSprites.set(im,tinted(tinted(im,'rgba(81,111,126,.08)'),'rgba(20,30,38,.06)'));return wetSprites.get(im)}
const sheenCache=new WeakMap();
function wetSheen(im){if(sheenCache.has(im))return sheenCache.get(im);const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
 const glow=g.createLinearGradient(15,110,95,5);glow.addColorStop(0,'rgba(238,246,231,0)');glow.addColorStop(.4,'rgba(238,246,231,.02)');glow.addColorStop(.58,'rgba(238,246,231,.55)');glow.addColorStop(.72,'rgba(238,246,231,.08)');glow.addColorStop(1,'rgba(238,246,231,0)');g.fillStyle=glow;g.fillRect(0,0,128,128);
 for(let i=0;i<5;i++){g.strokeStyle=`rgba(241,248,237,${.12+i*.025})`;g.lineWidth=1.2;g.beginPath();g.moveTo(34+i*9,84-i*4);g.quadraticCurveTo(46+i*8,61-i*3,51+i*8,39+i*2);g.stroke()}
 g.globalCompositeOperation='destination-in';g.drawImage(im,0,0,128,128);sheenCache.set(im,c);return c}
const mapleSun=sprites.map(im=>tinted(im,'rgba(255,239,164,.38)'));
const loadImage=src=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src});
const muhlyImages=await Promise.all(['assets/muhly-panicles-v1.png','assets/muhly-panicles-open-v1.png'].map(loadImage));
const muhlyTextures=[];
{
 const source=await loadImage('assets/muhly-swept-canopy-v1.png');
 if(source){const patch=document.createElement('canvas');patch.width=1024;patch.height=Math.round(1024*source.height/source.width);const g=patch.getContext('2d');g.filter='blur(.5px)';g.drawImage(source,0,0,patch.width,patch.height);g.filter='none';g.globalCompositeOperation='source-atop';g.fillStyle='rgba(245,207,217,.18)';g.fillRect(0,0,patch.width,patch.height);g.globalCompositeOperation='destination-in';const fade=g.createLinearGradient(0,0,0,patch.height);fade.addColorStop(0,'white');fade.addColorStop(.58,'white');fade.addColorStop(.80,'rgba(255,255,255,.55)');fade.addColorStop(1,'transparent');g.fillStyle=fade;g.fillRect(0,0,patch.width,patch.height);const pixels=g.getImageData(0,0,patch.width,patch.height).data,mask={width:64,height:32,data:[]};for(let y=0;y<32;y++)for(let x=0;x<64;x++)mask.data.push(pixels[(Math.floor((y+.5)*patch.height/32)*patch.width+Math.floor((x+.5)*patch.width/64))*4+3]);patch.hitAlpha=mask;muhlyTextures.swept=patch}
}
muhlyTextures.greenPocket=await loadImage('assets/muhly-green-pocket-v3.png');
for(const image of muhlyImages)for(const color of ['rgba(184,111,145,.1)','rgba(209,151,174,.08)','rgba(153,111,143,.14)','rgba(255,225,219,.1)']){if(!image){muhlyTextures.push(null);continue}const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.filter='blur(1.3px)';g.drawImage(image,0,0,512,512);g.filter='none';g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,512,512);g.globalCompositeOperation='destination-in';const rootFade=g.createLinearGradient(0,0,0,512);rootFade.addColorStop(0,'#fff');rootFade.addColorStop(.68,'#fff');rootFade.addColorStop(.80,'rgba(255,255,255,.68)');rootFade.addColorStop(.91,'rgba(255,255,255,.06)');rootFade.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rootFade;g.fillRect(0,0,512,512);muhlyTextures.push(c)}
const needleTuft=await loadImage('assets/needle-tuft-image-v4.png');
const needleTextures=[];
for(let variant=0;variant<2;variant++)for(const color of ['rgba(126,155,105,.18)','rgba(196,210,166,.10)','rgba(107,140,95,.23)','rgba(240,242,219,.08)']){
 if(!needleTuft){needleTextures.push(null);continue}
 const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.filter='blur(.65px)';
 if(variant){g.translate(512,0);g.scale(-1,1)}g.drawImage(needleTuft,0,0,512,512);g.setTransform(1,0,0,1,0,0);g.filter='none';
 g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,512,512);
 g.globalCompositeOperation='destination-in';const fade=g.createLinearGradient(0,0,0,512);fade.addColorStop(0,'white');fade.addColorStop(.55,'white');fade.addColorStop(.77,'rgba(255,255,255,.38)');fade.addColorStop(.89,'rgba(255,255,255,.035)');fade.addColorStop(.97,'transparent');fade.addColorStop(1,'transparent');g.fillStyle=fade;g.fillRect(0,0,512,512);needleTextures.push(c);
}
const ginkgoImages=await Promise.all(['ginkgo-leaf.png','ginkgo-deep.png','ginkgo-folded.png'].map(name=>loadImage('assets/'+name)));const ginkgoImage=ginkgoImages[0];
const ginkgoTones=ginkgoImages.map(im=>['rgba(210,148,43,.35)','rgba(243,175,48,.28)','rgba(255,214,89,.22)'].map(color=>tinted(im,color)));
const ginkgoSun=ginkgoImages.map(im=>tinted(im,'rgba(255,235,143,.4)'));
const jacarandaCluster=await loadImage('assets/jacaranda-cluster-muted-stems.png'),jacarandaFlower=await loadImage('assets/jacaranda-flower-light.png');
const jacarandaTones=[jacarandaCluster,tinted(jacarandaCluster,'rgba(134,111,178,.12)'),tinted(jacarandaCluster,'rgba(109,94,153,.2)')];
const jacarandaSun=tinted(jacarandaCluster,'rgba(255,253,246,.36)');
const willowImage=await loadImage('assets/willow-leaf.png');
const willowVariants=await Promise.all([0,1,2,3].map(i=>loadImage(`assets/willow-tone-${i}.png`)));
const willowTones=willowVariants.slice(0,3),willowSun=willowVariants[3];
const cherryImages=await Promise.all(['cherry-blossom.png','cherry-side.png','cherry-bud.png'].map(name=>loadImage('assets/'+name)));const cherryImage=cherryImages[0];
const cherryTones=cherryImages.map(im=>['rgba(255,255,255,.58)','rgba(255,249,251,.50)','rgba(255,237,244,.44)'].map(color=>tinted(im,color)));
const cherrySun=cherryImages.map(im=>tinted(im,'rgba(255,255,255,.65)'));
const petalImage=await new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src='assets/cherry-petal.png'});
const petalVisible=tinted(petalImage,'rgba(246,213,224,.16)');
let scale=1,leafScale=1,ox=0,oy=0,width=0,height=0,raf=0,last=null,acc=0,pointer=null,pending=[],previous=null,velocity={x:0,y:0},pulse=0,trail=[];
let willowMesh=null,willowMeshFailed=false;
let treeDirty=true,treeWasActive=false,treeRevision=0,treePaintTime=-Infinity;
const media=matchMedia('(prefers-reduced-motion: reduce)'),FRAME_STEP=1/60;sim.setReduced(media.matches);
// Cache the untouched crown, so falling leaves and wind never change the camera.
const crownFrames=new Map();
function crownFrame(kind){
 if(crownFrames.has(kind))return crownFrames.get(kind);
 const tree=new Study(kind);let left=450,right=450,top=745;
 for(const l of tree.leaves){const radius=l.size*1.2;left=Math.min(left,l.x-radius);right=Math.max(right,l.x+radius);top=Math.min(top,l.y-radius)}
 const frame={halfWidth:Math.max(450-left,right-450),height:745-top};crownFrames.set(kind,frame);return frame;
}
function resize(){treeDirty=true;fireflies.configure(species,moonlit);const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,width<=600?(species==='willow'?2:1.5):2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);plantCanvas.width=canvas.width;plantCanvas.height=canvas.height;plantCtx.setTransform(dpr,0,0,dpr,0,0);const portrait=width<=600&&height>width,frameHeight=portrait?height:height-110;scale=portrait?Math.min(width/650,frameHeight/710):Math.min(width/900,(height-160)/880);leafScale=portrait?1.18:1;ox=(width-900*scale)/2;oy=portrait?(frameHeight-800*scale)/2-12:85+((height-160)-800*scale)/2;if(portrait)oy=Math.min(oy,height-162-745*scale);const root=oy+745*scale;if(!isGrass()&&species!=='willow'){scale*=portrait||height>width?1.03:1.06;ox=(width-900*scale)/2;oy=root-745*scale}if(!isGrass()){
 const kinds=['maple','ginkgo','cherry','willow','jacaranda'];
 const frame=crownFrame(species);
 const availableHeight=Math.max(height*.3,Math.min(height*.74,height-175));
 const centerY=Math.min(height*.47,height-140-availableHeight/2);
 // Equal visual footprint, rather than equal world scale, respects each silhouette.
 let footprint=Math.sqrt(width*height*.78);
 for(const kind of kinds){const f=crownFrame(kind),area=2*f.halfWidth*f.height;
  const limit=Math.min(width*1.16/(2*f.halfWidth),availableHeight/f.height);
  footprint=Math.min(footprint,Math.sqrt(area)*limit);
 }
 leafScale=1.08;
 scale=Math.max(.01,footprint/Math.sqrt(2*frame.halfWidth*frame.height));
 if(species==='cherry'||species==='willow')scale*=1.045;
 if(species==='jacaranda')scale*=1.08;
 if(species==='ginkgo')scale*=1.04;
 const rootY=centerY+frame.height*scale/2;
 ox=width/2-450*scale;oy=rootY-745*scale;
 }previous=null;pending=[];rain.resize(width,height,oy+745*scale);moon.resize(width,height,oy+745*scale);wake()}
function world(e){const r=canvas.getBoundingClientRect();if(isGrass())return Object.assign({},sim.fromScreen(e.clientX-r.left,e.clientY-r.top,width,height,oy+745*scale),{t:e.timeStamp});return{x:(e.clientX-r.left-ox)/scale,y:(e.clientY-r.top-oy)/scale,t:e.timeStamp}}
function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame)}
function finish(){input();if(pointer!==null&&canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);pointer=null;previous=null;pending=[];velocity={x:0,y:0};wake()}
canvas.addEventListener('pointerdown',e=>{if(pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;pointer=e.pointerId;canvas.setPointerCapture(pointer);previous=world(e);pending=[];velocity={x:0,y:0};sim.beginGesture();if(moonlit)fireflies.disturb(previous,previous,sim.reduced);if(rainy){water.bind(sim);water.touch(previous,previous,sim.reduced)}wake()});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;const p=world(e);pending.push(p);if(pending.length>8)pending.shift();if(previous&&p.x>90&&p.x<810&&p.y<(isGrass()?780:550))audio.stir(Math.min(1,Math.hypot(p.x-previous.x,p.y-previous.y)/45));wake()});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(e.pointerId===pointer)finish()});window.addEventListener('blur',finish);
function input(){if(!pending.length)return;const batch=pending.splice(0),a=previous;for(const p of batch){if(species==='needle'&&previous)sim.drag(previous,p);if(previous){const dt=(p.t-previous.t)/1000;if(dt>0){const span=Math.min(.08,Math.max(.008,dt));let vx=(p.x-previous.x)/span,vy=(p.y-previous.y)/span,s=Math.min(1,1800/(Math.hypot(vx,vy)||1)),k=1-Math.exp(-span/.028);velocity.x+=(vx*s-velocity.x)*k;velocity.y+=(vy*s-velocity.y)*k}else velocity={x:0,y:0}}previous=p}if(a&&previous){if(moonlit)fireflies.disturb(a,previous,sim.reduced);if(species==='muhly'&&previous.inside===false)return;sim.brush(a,previous);for(const note of instrument.cross(sim,a,previous,performance.now()/1000))audio.playBranch(note.midi,Math.min(1,Math.hypot(velocity.x,velocity.y)/1500)*(isGrass()?.72:1));if(rainy){water.bind(sim);water.touch(a,previous,sim.reduced)}if(species==='muhly')sim.drag(a,previous,velocity);else if(species!=='needle'){const distance=Math.hypot(previous.x-a.x,previous.y-a.y),count=Math.max(1,Math.min(3,Math.ceil(distance/65)));for(let i=0;i<count;i++){const from={x:a.x+(previous.x-a.x)*i/count,y:a.y+(previous.y-a.y)*i/count},to={x:a.x+(previous.x-a.x)*(i+1)/count,y:a.y+(previous.y-a.y)*(i+1)/count};sim.emit(from,to,{x:velocity.x*2.2*Math.min(.05,(previous.t-a.t)/1000)/FRAME_STEP/count,y:velocity.y*2.2*Math.min(.05,(previous.t-a.t)/1000)/FRAME_STEP/count})}}if(previous.x>90&&previous.x<810&&previous.y<(isGrass()?780:550))audio.stir(Math.hypot(velocity.x,velocity.y)/1300);if(!sim.reduced){trail.push({x:previous.x,y:previous.y,age:0});if(trail.length>12)trail.shift()}}}
function frame(t){raf=0;const dt=last===null?FRAME_STEP:Math.min(.05,(t-last)/1000);last=t;acc+=dt;input();let n=0;while(acc>=FRAME_STEP&&n++<3){if(pulse>0){pulse-=FRAME_STEP;{const p=sim.point(sim.branches[3],.6);sim.emit({x:p.x-45,y:p.y+50},{x:p.x+25,y:p.y-40},{x:1150,y:-650})}}swipeHint.step(FRAME_STEP,sim);if(!isGrass()&&!sim.active&&pointer===null&&pulse<=0&&!swipeHint.active){sim.time+=FRAME_STEP;sim.tokens=Math.min(3,sim.tokens+FRAME_STEP*(species==='willow'?4:12));for(const l of sim.leaves)l.age+=FRAME_STEP}else sim.step(FRAME_STEP);if(moonlit)fireflies.step(FRAME_STEP,sim.reduced);if(rainy){rain.step(FRAME_STEP,sim.reduced);water.bind(sim);water.step(FRAME_STEP,sim.reduced);water.hitRain(rain,ox,oy,scale,sim.reduced)}for(const p of trail)p.age+=FRAME_STEP;trail=trail.filter(p=>p.age<.45);acc-=FRAME_STEP}render();if(pointer!==null||pulse>0||swipeHint.active||sim.active||(rainy&&!sim.reduced)||(moonlit&&fireflies.active&&!sim.reduced)||trail.length)wake();else{last=null;acc=0;if(isGrass())return;for(const b of sim.branches){b.theta=b.omega=0;if(b.restCurve){b.bend=b.bendVelocity=b.renderedBend=0;b.c=b.restCurve.map(p=>[...p]);b.renderOutline=null}}sim.transform();for(const l of sim.leaves)if(l.state==='attached')Object.assign(l,sim.anchor(l));render();}}
 function render(){
 ctx.clearRect(0,0,width,height);if(rainy)rain.background(ctx,sim.reduced);if(moonlit){moon.background(ctx);if(!isGrass())fireflies.draw(ctx,ox,oy,scale,true,sim.reduced);}if(isGrass()){sim.draw(ctx,width,height,species==='needle'?needleTextures:muhlyTextures,oy+745*scale,moonlit?'moon':rainy?'rain':'day');if(rainy)rain.foreground(ctx,sim.reduced);return}const moving=sim.active||pointer!==null||pulse>0||swipeHint.active||trail.length>0;if(treeDirty||((rainy||moving||treeWasActive)&&(!rainy||width>600||performance.now()-treePaintTime>=32))){treeDirty=false;treePaintTime=performance.now();treeRevision++;ctx=plantCtx;ctx.clearRect(0,0,width,height);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.save();const sway=sim.reduced||!rainy?0:Math.sin(rain.time*.38)*.002+Math.sin(rain.time*.13)*.001;ctx.translate(450,745);ctx.rotate(sway);ctx.translate(-450,-745);

 ctx.save();ctx.translate(454,747);ctx.scale(1,.16);const shadow=ctx.createRadialGradient(0,0,2,0,0,95);shadow.addColorStop(0,'rgba(86,105,78,.15)');shadow.addColorStop(1,'rgba(105,106,74,0)');ctx.fillStyle=shadow;ctx.fillRect(-95,-95,190,190);ctx.restore();
 // Back leaves remain independently removable, including while growing.
 const cherryBatch=species==='cherry'&&width<=600&&!willowMeshFailed&&typeof ctx.getTransform==='function';
 if(!cherryBatch||!drawCherryMesh(true))for(const l of sim.leaves)if(species!=='willow'&&['attached','loosening','growing'].includes(l.state)&&l.layer==='back')leaf(l);
 for(const b of sim.branches)drawBranch(b);
 if(cherryBatch&&drawCherryMesh(false)){}else if(species==='willow'&&width<=600&&!willowMeshFailed&&typeof ctx.getTransform==='function'){if(!drawWillowMesh())drawWillowLeaves()}else if(species==='willow'&&!rainy&&typeof ctx.getTransform==='function')drawWillowLeaves();else for(const l of sim.leaves){if(!['attached','loosening','growing'].includes(l.state)||(species!=='willow'&&l.layer==='back'))continue;const b=sim.branches[l.branch],p=sim.point(b,l.t);if(species!=='cherry'&&species!=='willow'&&species!=='jacaranda'&&species!=='muhly'){ctx.strokeStyle='rgba(111,121,76,.28)';ctx.lineWidth=.35;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(l.x,l.y);ctx.stroke()}leaf(l)}
 for(const l of sim.leaves)if(!['attached','loosening','growing','gone'].includes(l.state))leaf(l);
 for(const p of sim.petals)petal(p);if(rainy)water.draw(ctx);ctx.restore();

 if(trail.length>1){ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(const p of trail)ctx.lineTo(p.x,p.y);ctx.strokeStyle=`rgba(135,151,113,${Math.max(0,.14*(1-trail[0].age/.45))})`;ctx.lineWidth=1;ctx.stroke()}ctx.restore();ctx=displayCtx;}treeWasActive=!!moving;if(moonlit)moon.shadow(ctx,plantCanvas,oy+745*scale,treeRevision);ctx.drawImage(plantCanvas,0,0,width,height);swipeHint.draw(ctx,ox,oy,scale,moonlit);if(moonlit)fireflies.draw(ctx,ox,oy,scale,false,sim.reduced);if(rainy)rain.foreground(ctx,sim.reduced);
}
function point(c,t){const u=1-t;return{x:u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y:u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]}}
function drawBranch(b){
 if(b.hidden)return;

 ctx.save();if(species==='willow'&&b.parent>=0)ctx.globalAlpha=b.depth===1?.55:.7;if(species==='jacaranda'&&b.parent>=0)ctx.globalAlpha=b.depth===1?.88:.78;ctx.translate(b.origin.x,b.origin.y);ctx.rotate(b.angle);
 if(!b.renderOutline){const sides=[[],[]];for(let i=0;i<=32;i++){const t=i/32,p=point(b.c,t),q=point(b.c,Math.min(1,t+.001)),r=point(b.c,Math.max(0,t-.001)),a=Math.atan2(q.y-r.y,q.x-r.x)+Math.PI/2;const radius=b.width*.5*Math.pow(1-t,.8)+.3;for(let side=0;side<2;side++){const sign=side?1:-1;sides[side].push({x:p.x+Math.cos(a)*radius*sign,y:p.y+Math.sin(a)*radius*sign})}}
 const outline=new Path2D();outline.moveTo(sides[0][0].x,sides[0][0].y);for(const p of [...sides[0].slice(1),...sides[1].reverse()])outline.lineTo(p.x,p.y);outline.closePath();b.renderOutline=outline;}const outline=b.renderOutline;
 const tone=ctx.createLinearGradient(-b.width,0,b.width,0);const bark=species==='willow'?(b.width<2?['#82934c','#b7c86d','#9dae59','#82934c']:['#686d59','#9c9e7a','#777d61','#686d59']):species==='ginkgo'?['#5c503c','#968368','#745f46','#64533f']:species==='jacaranda'?['#484541','#766b61','#5b544e','#443f3b']:species==='cherry'?['#715e5c','#a38e86','#8e7771','#705d59']:(rainy?['#626555','#8c8b75','#787b66','#656958']:['#716e58','#a19a7f','#8d876e','#77735f']);if(moonlit){bark[0]='#82949a';bark[1]=species==='jacaranda'?'#7d8581':bark[1]}tone.addColorStop(0,bark[0]);tone.addColorStop(.45,bark[1]);tone.addColorStop(.75,bark[2]);tone.addColorStop(1,bark[3]);ctx.fillStyle=tone;ctx.fill(outline);
 if(b.width>5){ctx.clip(outline);for(let i=0;i<9;i++){ctx.strokeStyle=i%2?'rgba(222,212,172,.3)':'rgba(78,77,61,.20)';ctx.lineWidth=.5+(i%3)*.4;ctx.beginPath();for(let j=0;j<16;j++){const t=j/15,p=point(b.c,t),x=p.x+Math.sin(j*.7+i)*2+(i-4)*b.width/10;j?ctx.lineTo(x,p.y):ctx.moveTo(x,p.y)}ctx.stroke()}}ctx.restore();
}
function drawCherryMesh(back){
 try{
  if(!willowMesh)willowMesh=new GrassMesh();const base=ctx.getTransform(),items=[];
  for(const l of sim.leaves){if((l.layer==='back')!==back||!['attached','loosening','growing'].includes(l.state))continue;
   const sun=!rainy&&!moonlit&&l.id%7===0&&l.x<650&&l.y<530;
   let image=(sun?cherrySun[l.sprite]:(cherryTones[l.sprite]&&cherryTones[l.sprite][l.tone]))||cherryImage;if(!image)continue;if(rainy)image=wetImage(image);if(moonlit)image=moon.leaf(image,l,species);
   const hit=rainy?water.hit(l):null,kick=hit?Math.sin(hit.age*25)*Math.exp(-hit.age*6):0,growth=l.state==='growing'&&!sim.reduced?l.growth*l.growth*(3-2*l.growth):1,w=l.size*(l.petal?.8:l.sprite===2?.75:1),h=w*image.height/image.width,k=leafScale*(back?.92:1)*growth,c=Math.cos(l.angle+kick*.065)*k,s=Math.sin(l.angle+kick*.065)*k,alpha=l.alpha*(back?.88:1);
   const points=[[-w*.5,-h*.85],[w*.5,-h*.85],[-w*.5,h*.15],[w*.5,h*.15]].map(([x,y])=>{const px=l.x+c*x-s*y,py=l.y+kick*3.2+s*x+c*y;return{x:base.a*px+base.c*py+base.e,y:base.b*px+base.d*py+base.f}});items.push({image,points,alpha});
   if(rainy){if(l.state==='attached'&&!back&&(l.id%4===0||hit)){const facing=Math.pow(Math.max(0,Math.cos(l.angle*.8+l.id*.71)),3),variation=sim.reduced?1:.85+.15*Math.sin(water.time*.6+l.id);items.push({image:wetSheen(image),points,alpha:alpha*(.09+facing*.23)*variation+(hit?Math.exp(-hit.age*12)*.19:0)})}water.anchor(l,image,w,h,leafScale*(back?.92:1),false)}
  }
  willowMesh.drawSprites(ctx,items,plantCanvas.width,plantCanvas.height);return true;
 }catch(e){willowMeshFailed=true;if(willowMesh)willowMesh.dispose();willowMesh=null;return false}
}
function drawWillowMesh(){
 try{
  if(!willowMesh)willowMesh=new GrassMesh();const base=ctx.getTransform(),items=[];
  for(const l of sim.leaves){if(!['attached','loosening','growing'].includes(l.state))continue;
   let image=(!rainy&&!moonlit&&l.id%7===0&&l.x<650&&l.y<530?willowSun:willowTones[l.tone])||willowImage;if(!image)continue;if(rainy)image=wetImage(image);if(moonlit)image=moon.leaf(image,l,species);
   const hit=rainy?water.hit(l):null,kick=hit?Math.sin(hit.age*25)*Math.exp(-hit.age*6):0,growth=l.state==='growing'&&!sim.reduced?l.growth*l.growth*(3-2*l.growth):1,w=l.size,h=w*image.height/image.width,k=leafScale*(l.layer==='back'?.92:1)*growth,c=Math.cos(l.angle+kick*.065)*k,s=Math.sin(l.angle+kick*.065)*k,alpha=l.alpha*(l.layer==='back'?.88:1);
   const points=[[-w*.34,-h*.1],[w*.34,-h*.1],[-w*.34,h*.9],[w*.34,h*.9]].map(([x,y])=>{const px=l.x+c*x-s*y,py=l.y+kick*3.2+s*x+c*y;return{x:base.a*px+base.c*py+base.e,y:base.b*px+base.d*py+base.f}});items.push({image,points,alpha});
   if(rainy){if(l.state==='attached'&&l.layer!=='back'&&(l.id%4===0||hit)){const facing=Math.pow(Math.max(0,Math.cos(l.angle*.8+l.id*.71)),3),variation=sim.reduced?1:.85+.15*Math.sin(water.time*.6+l.id);items.push({image:wetSheen(image),points,alpha:alpha*(.09+facing*.23)*variation+(hit?Math.exp(-hit.age*12)*.19:0)})}water.anchor(l,image,w,h,leafScale*(l.layer==='back'?.92:1),true)}
  }
  willowMesh.drawSprites(ctx,items,plantCanvas.width,plantCanvas.height);return true;
 }catch(e){willowMeshFailed=true;if(willowMesh)willowMesh.dispose();willowMesh=null;return false}
}
// Use one affine transform per narrow willow leaf instead of five canvas state calls.
function drawWillowLeaves(){
 const base=ctx.getTransform();ctx.save();
 for(const l of sim.leaves){if(!['attached','loosening','growing'].includes(l.state))continue;
  if(l.state==='growing'){ctx.setTransform(base.a,base.b,base.c,base.d,base.e,base.f);leaf(l);continue}
  let im=(!moonlit&&l.id%7===0&&l.x<650&&l.y<530?willowSun:willowTones[l.tone])||willowImage;if(!im)continue;if(moonlit)im=moon.leaf(im,l,species);
  const w=l.size,h=w*im.height/im.width,k=leafScale*(l.layer==='back'?.92:1),c=Math.cos(l.angle)*k,s=Math.sin(l.angle)*k;
  ctx.setTransform(base.a*c+base.c*s,base.b*c+base.d*s,-base.a*s+base.c*c,-base.b*s+base.d*c,base.a*l.x+base.c*l.y+base.e,base.b*l.x+base.d*l.y+base.f);
  ctx.globalAlpha=l.alpha*(l.layer==='back'?.88:1);ctx.drawImage(im,-w*.34,-h*.1,w*.68,h);
  if(moonlit&&width>600&&l.id%4===0)moon.glint(ctx,l,im,w,h,species);
 }
 ctx.restore();
}
function fallingTransform(l){
 if(species==='ginkgo'){const face=Math.cos(l.age*5.2+l.id*.37);ctx.scale(Math.sign(face)*Math.max(.12,Math.abs(face)),.78+.22*Math.abs(Math.sin(l.age*5.2+l.id*.37)));return}
 if(species==='jacaranda'){const face=Math.cos(l.age*6.3+l.id*.91);ctx.scale(Math.sign(face)*Math.max(.16,Math.abs(face)),.7+.22*Math.abs(Math.sin(l.age*4.1+l.id)));return}
 if(species==='willow'){ctx.scale(.2+.8*Math.abs(Math.cos(l.age*5.1+l.id*.37)),1);return}
 if(species==='cherry'){ctx.scale(.3+.7*Math.abs(Math.cos(l.age*4.2)),1);return}
 const phase=l.age*(2.1+(l.id%5)*.23)+l.id*.61,face=Math.cos(phase);
 ctx.transform(1,Math.sin(phase*.7)*.08,Math.sin(phase)*.12,1,0,0);
 ctx.scale((face>=0?1:-1)*Math.max(.18,Math.abs(face)),.78+.18*Math.abs(Math.sin(phase*.53)));
}
function leaf(l){const visualState=l.state;ctx.save();ctx.globalAlpha=l.alpha*(l.layer==='back'?(species==='ginkgo'?.82:species==='willow'?.88:species==='jacaranda'?.8:species==='cherry'?.88:.7):1);const hit=rainy?water.hit(l):null,hitAge=hit?hit.age:0,kick=hit?Math.sin(hitAge*25)*Math.exp(-hitAge*6):0;ctx.translate(l.x,l.y+kick*3.2);ctx.rotate(l.angle+kick*.065);ctx.scale(leafScale*(l.layer==='back'?.92:1),leafScale*(l.layer==='back'?.92:1));if(l.state==='growing'&&!sim.reduced){const g=l.growth*l.growth*(3-2*l.growth);ctx.scale(g,g)}if(l.state==='falling'&&!sim.reduced)fallingTransform(l);const sun=!rainy&&!moonlit&&l.id%7===0&&l.x<650&&l.y<530&&(species!=='maple'||l.tone!==4);let im=species==='jacaranda'?(['falling','grounded','fading'].includes(visualState)?jacarandaFlower:(l.id%9<3&&l.x<660&&l.y<620?jacarandaSun:jacarandaTones[l.tone]||jacarandaCluster)):species==='ginkgo'?(sun?ginkgoSun[l.sprite]:ginkgoTones[l.sprite]?.[l.tone])||ginkgoImage:species==='willow'?(sun?willowSun:willowTones[l.tone]||willowImage):species==='cherry'?(l.petal&&l.state!=='attached'&&l.state!=='loosening'&&l.state!=='growing'?(petalVisible||petalImage||cherryImage):sun?cherrySun[visualState==='falling'?1:l.sprite]:(cherryTones[visualState==='falling'?1:l.sprite]?.[l.tone]||cherryImage)):(sun?mapleSun[l.sprite]:leafTones[l.sprite][l.tone]||sprites[l.sprite]);if(rainy)im=wetImage(im);if(moonlit)im=moon.leaf(im,l,species);if(im){const w=l.size*(species==='jacaranda'&&['falling','grounded','fading'].includes(visualState)?(.27+(l.id%5)*.025)*1.35:l.petal?.8:species==='cherry'?(visualState==='falling'?.72:l.sprite===2?.75:1):species==='ginkgo'?(visualState==='falling'||visualState==='grounded'||visualState==='fading'?.7:1)*(l.sprite===1?.78:l.sprite===2?.68:1):1),h=w*im.height/im.width;ctx.drawImage(im,-w*(species==='willow'?.34:.5),species==='willow'?-h*.1:species==='jacaranda'?-h*.5:-h*.85,species==='willow'?w*.68:w,h);if(moonlit&&width>600&&(species!=='willow'||l.id%4===0))moon.glint(ctx,l,im,w,h,species);if(rainy&&l.state==='attached'&&l.layer!=='back'&&(l.id%4===0||hit)){const alpha=ctx.globalAlpha;const facing=Math.pow(Math.max(0,Math.cos(l.angle*.8+l.id*.71)),3),variation=sim.reduced?1:.85+.15*Math.sin(water.time*.6+l.id);ctx.globalAlpha=alpha*(.09+facing*.23)*variation+(hit?Math.exp(-hitAge*12)*.19:0);ctx.drawImage(wetSheen(im),-w*(species==='willow'?.34:.5),species==='willow'?-h*.1:species==='jacaranda'?-h*.5:-h*.85,species==='willow'?w*.68:w,h);ctx.globalAlpha=alpha}if(rainy)water.anchor(l,im,w,h,leafScale*(l.layer==='back'?.92:1),species==='willow')}else{ctx.fillStyle=l.id%3?'#a5ad73':'#cfba72';ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-12,-8,-8,-18,0,-24);ctx.fill()}ctx.restore()}
function petal(p){if(!petalVisible&&!petalImage)return;ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(leafScale,leafScale);const im=petalVisible||petalImage,w=p.size,h=w*im.height/im.width;ctx.drawImage(im,-w*.5,-h*.5,w,h);ctx.restore()}
for(const button of document.querySelectorAll('.species-picker button'))button.addEventListener('click',()=>{if(button.dataset.species===species)return;finish();species=button.dataset.species;document.querySelector('main').dataset.species=species;if(willowMesh){willowMesh.dispose();willowMesh=null}if(sim.dispose)sim.dispose();sim=makeSimulation(species);moon.reset();sim.setReduced(media.matches);for(const b of document.querySelectorAll('.species-picker button'))b.setAttribute('aria-pressed',String(b===button));pulse=0;trail=[];last=null;acc=0;resize()});
document.querySelector('#breeze').addEventListener('click',()=>{sim.beginGesture();if(isGrass())sim.breeze();else pulse=1;audio.stir(.55);wake()});
const soundButton=document.querySelector('#sound');soundButton.setAttribute('aria-pressed',String(audio.enabled));soundButton.setAttribute('aria-label',audio.enabled?'关闭声音':'开启声音');soundButton.addEventListener('click',()=>{const on=audio.setEnabled(!audio.enabled);soundButton.setAttribute('aria-pressed',String(on));soundButton.setAttribute('aria-label',on?'关闭声音':'开启声音')});
document.addEventListener('pointerdown',e=>{swipeHint.dismiss();if(!e.target.closest('#sound'))audio.activate()},{capture:true});document.addEventListener('keydown',()=>{swipeHint.dismiss();audio.activate()},{capture:true});
 document.querySelector('#reset').addEventListener('click',()=>{finish();treeDirty=true;sim.reset();rain.reset();water.reset();moon.reset();fireflies.reset();sim.setReduced(media.matches);pulse=0;trail=[];last=null;acc=0;wake()});
 media.addEventListener('change',e=>{treeDirty=true;if(e.matches)swipeHint.dismiss();sim.setReduced(e.matches);trail=[];wake()});
 let moonDrift=0;function drift(){if(document.hidden||(moonlit&&++moonDrift%6!==0))return;let shed=false;for(let i=0;i<(species==='cherry'?2:1);i++)shed=sim.shedAmbient()||shed;if(shed)wake()}
 setInterval(drift,2200);
 function flurry(){if(document.hidden||sim.reduced||moonlit)return;for(let i=0;i<(species==='willow'?3:9);i++)setTimeout(drift,i*170)}
 setTimeout(()=>{flurry();setInterval(flurry,20000)},4800);
 document.addEventListener('visibilitychange',()=>{audio.visibility(document.hidden);if(document.hidden){swipeHint.dismiss();finish();cancelAnimationFrame(raf);raf=0;last=null;acc=0;sim.wind=[];pulse=0;trail=[]}else wake()});new ResizeObserver(resize).observe(canvas);resize();

const sceneButtons=Array.from(document.querySelectorAll('#weather button'));
const sceneOrder=['day','rain','moon'];
function setScene(scene){finish();rainy=scene==='rain';moonlit=scene==='moon';const chromeColor=scene==='moon'?'#405d7a':scene==='rain'?'#8d9f9e':'#c4d6d5';document.querySelector('meta[name="theme-color"]').setAttribute('content',chromeColor);document.documentElement.style.backgroundColor=chromeColor;audio.setWeather(scene);water.reset();moon.reset();document.querySelector('main').dataset.scene=scene;for(const button of sceneButtons)button.setAttribute('aria-pressed',String(button.dataset.scene===scene));last=null;acc=0;resize()}
let sceneAnimationTimer=0;
function animateSceneIcon(button){clearTimeout(sceneAnimationTimer);for(const item of sceneButtons)item.classList.remove('scene-animate');if(media.matches)return;void button.offsetWidth;button.classList.add('scene-animate');sceneAnimationTimer=setTimeout(()=>button.classList.remove('scene-animate'),760)}
for(const button of sceneButtons)button.addEventListener('click',()=>{if(button.getAttribute('aria-pressed')!=='true')setScene(button.dataset.scene);animateSceneIcon(button)});
const requestedScene=new URLSearchParams(location.search).get('scene');setScene(sceneOrder.includes(requestedScene)?requestedScene:'day');

if(new URLSearchParams(location.search).get('plant')==='needle')document.querySelector('button[data-species=needle]').click();

setTimeout(()=>{if(!document.hidden&&swipeHint.start(sim,sim.reduced))wake()},1500);

// Hide only the controls; simulation, canvas input and audio continue unchanged.
const immersiveButton=document.querySelector('#immersive');
const quietControls=Array.from(document.querySelectorAll('#weather,.species-picker,#tools'));
function setImmersive(active){
 document.querySelector('main').classList.toggle('is-immersive',active);
 for(const control of quietControls)control.inert=active;
 immersiveButton.setAttribute('aria-pressed',String(active));
 const label=active?'显示界面':'隐藏界面';immersiveButton.setAttribute('aria-label',label);immersiveButton.title=label;
 if(active){closeTools(false);swipeHint.dismiss()}
}
immersiveButton.addEventListener('click',()=>setImmersive(immersiveButton.getAttribute('aria-pressed')!=='true'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&immersiveButton.getAttribute('aria-pressed')==='true'){setImmersive(false);immersiveButton.focus({preventScroll:true})}});

const tools=document.querySelector('#tools'),toolsToggle=document.querySelector('#tools-toggle'),toolActions=document.querySelector('#tool-actions');
function closeTools(returnFocus){
 toolsToggle.setAttribute('aria-expanded','false');toolsToggle.setAttribute('aria-label','展开工具');toolsToggle.title='展开工具';
 toolActions.inert=true;toolActions.setAttribute('aria-hidden','true');tools.classList.remove('is-open');
 if(returnFocus)toolsToggle.focus({preventScroll:true});
}
toolsToggle.addEventListener('click',()=>{
 if(toolsToggle.getAttribute('aria-expanded')==='true'){closeTools(false);return}
 toolsToggle.setAttribute('aria-expanded','true');toolsToggle.setAttribute('aria-label','收起工具');toolsToggle.title='收起工具';
 toolActions.inert=false;toolActions.setAttribute('aria-hidden','false');tools.classList.add('is-open');
});
toolActions.addEventListener('click',e=>{if(e.target.closest('button'))closeTools(true)});
document.addEventListener('pointerdown',e=>{if(!tools.contains(e.target))closeTools(false)});
document.addEventListener('focusin',e=>{if(!tools.contains(e.target))closeTools(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toolsToggle.getAttribute('aria-expanded')==='true'){closeTools(true);e.preventDefault()}});
