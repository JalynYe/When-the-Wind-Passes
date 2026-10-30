import {GrassMesh} from './grass-mesh.js?v=20261030batch';
import {MuhlyField} from './muhly-field.js?v=20261030seamless';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// ImageGen small transparent tufts; roots, spatial wind and interaction follow muhly.
export class NeedleGrassField extends MuhlyField{
 constructor(options={}){super(options);this.kind='needle';this.isGrass=true}
 reset(){super.reset();this.wakes=[];this.lastWake=null;
  // A tapering bank rises toward the upper-left, interlocking with the existing field.
  let seed=281150;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const sources=[...this.tufts];
  for(let i=0;i<44;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push({...source,id:900+i,z:.12+random()*.43,x:u*310,bankX:-.72+u*.47,bankRoot:.38+random()*.20,bankH:.48+.24*(1-u)+random()*.12,bankW:.21+random()*.035,width:.84+random()*.22,rest:.50+.13*Math.sin(u*5)+random()*.08,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.58+random()*.20,foliage:false})}
  // Staggered middle layers bridge the hollow between the raised left and right banks.
  for(let i=0;i<40;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push({...source,id:1000+i,z:.22+random()*.37,x:220+u*440,bankX:-.34+u*.55,bankRoot:.40+random()*.19,bankH:.42+.13*Math.sin(u*Math.PI)+random()*.12,bankW:.21+random()*.035,width:.84+random()*.22,rest:.47+.12*Math.sin(u*5)+random()*.08,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.59+random()*.18,foliage:false})}
  // Low overlapping sweeps cover the base of the raised bank with a soft transition.
  for(let i=0;i<26;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push({...source,id:1100+i,z:.57+random()*.22,x:110+u*560,bankX:-.48+u*.76,bankRoot:.22+random()*.19,bankH:.31+random()*.17,bankW:.22+random()*.03,width:.87+random()*.20,rest:.22+random()*.18,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.57+random()*.18,foliage:false})}
  // Low staggered fringe conceals repeated bundled bases, without a straight bottom edge.
  for(let i=0;i<34;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push({...source,id:1200+i,z:.96+random()*.04,x:u*900,bankX:-.59+u*1.16,bankRoot:-.012+random()*.064,bankH:.13+random()*.12,bankW:.10+random()*.035,width:.82+random()*.24,rest:.13+random()*.14,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.44+random()*.18,foliage:false})}
  // Loose lower-left infill, interleaved depths and heights rather than one flat fringe.
  for(let i=0;i<28;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push({...source,id:1300+i,z:.91+random()*.09,x:u*390,bankX:-.65+u*.44,bankRoot:-.018+random()*.11,bankH:.17+random()*.15,bankW:.12+random()*.045,width:.84+random()*.20,rest:.17+random()*.16,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.48+random()*.17,foliage:false})}
  // Targeted infill at the left-middle hollow, layered in front of the tall stems.
  for(let i=0;i<20;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push({...source,id:1400+i,z:.93+random()*.07,x:100+u*150,bankX:-.43+u*.19,bankRoot:-.005+random()*.075,bankH:.23+random()*.13,bankW:.13+random()*.035,width:.86+random()*.19,rest:.14+random()*.12,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.52+random()*.17,foliage:false})}
  // Extend only the lower-left bank, preserving the central controls' breathing room.
  for(let i=0;i<22;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push({...source,id:1500+i,z:.97+random()*.03,x:u*150,bankX:-.65+u*.30,bankRoot:-.105+random()*.06,bankH:.19+random()*.11,bankW:.12+random()*.035,width:.84+random()*.20,rest:.12+random()*.15,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.50+random()*.16,foliage:false})}
  // A small dipping edge at the extreme lower-left closes the remaining corner gap.
  for(let i=0;i<16;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push({...source,id:1600+i,z:.98+random()*.02,x:u*90,bankX:-.64+u*.20,bankRoot:-.165+random()*.045,bankH:.15+random()*.095,bankW:.105+random()*.025,width:.85+random()*.18,rest:.12+random()*.12,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.47+random()*.15,foliage:false})}
  for(const t of this.tufts){t.nativeArch=t.id>=900&&t.id<1100;t.curl=t.nativeArch?.025+random()*.025:t.bankX!==undefined?.14+random()*.12:0;if(t.nativeArch)t.rest=.035+random()*.06}
  // Keep blade lengths; vary root depths and bend the whole body, not only the tips.
  for(const t of this.tufts){const flow=.32+.085*Math.sin(t.x*.009-t.z*3.2);t.rest=clamp(t.rest+flow,.22,.56);t.curl=Math.max(t.curl,.09+.045*Math.sin(t.x*.013+t.z*4)**2);if(t.bankRoot!==undefined)t.bankRoot+=.045*Math.sin(t.id*1.71);else t.rootOffset=(t.rootOffset||0)+.028*Math.sin(t.id*1.71)}
  // Stagger the exposed left bank in depth and laterally without shortening its blades.
  for(const t of this.tufts)if(t.id>=900&&t.id<1000){t.bankRoot+=.075*Math.sin(t.id*2.13);t.bankX+=.024*Math.sin(t.id*1.19);t.rest=clamp(t.rest+.055*Math.sin(t.id*2.3),.22,.56)}
  // Thin the right foreground in pockets instead of leaving uniformly dense layers.
  this.tufts=this.tufts.filter(t=>{const lateral=t.bankX??this.ribbonX(t.x/900,t.z);return !(lateral>.10&&t.z>.55&&t.id%5===2)&&!(t.z<.8&&t.id%17===6)});
  // Prune only the lowest detached wisps at the extreme left; keep the filled bank.
  this.tufts=this.tufts.filter(t=>!(t.id>=1600&&(t.bankRoot<-.145||t.id%3===1))&&!(t.id>=1500&&t.bankRoot<-.155&&t.bankX<-.43));
  for(const t of this.tufts)if(t.id>=1600)t.bankRoot+=.025;
  this.tufts=this.tufts.filter(t=>t.z>.9||t.id%9!==4);this.tufts.sort((a,b)=>a.z-b.z);
  for(const t of this.tufts){t.kick=0;t.air=0;t.airFiltered=0;t.headVelocity=0;t.frequency=7.0+(t.id%7)*.14;t.damping=.74;t.alpha*=.92}this.leaves=[]}
 layout(width,height,groundY){const view=super.layout(width,height,groundY);view.groundY+=Math.min(23,height*.025);return view}
 project(t,view){if(t.bankX===undefined)return super.project(t,view);const h=view.patchHeight*t.bankH;return{x:view.centerX+t.bankX*view.patchWidth,root:view.groundY-view.patchHeight*t.bankRoot,h,w:t.nativeArch?h*(.96+(t.width-.84)*.35):view.patchWidth*(t.bankW??.17)*t.width}}
 canopyPoint(t,p,u){
  const curl=t.curl||0,staticX=t.rest*(.42*u+.58*u*u)+curl*u**3*(1-.5*u);
  // Dynamic slope is zero at the root; the user-approved resting arc is independent.
  const sway=t.bend*u**2.4+(t.head-t.bend)*u**5;
  const lowerTip=clamp(.18*(2*t.rest*t.bend+t.bend*t.bend),-.025,.035)*u**3;
  return{x:p.x+p.h*(staticX+sway),y:p.root-p.h*u+p.h*curl*.30*u**5+p.h*lowerTip};
 }
 beginGesture(){this.lastWake=null}
 brush(){}
 sampleWind(x,z){const base=super.sampleWind(x,z);if(!this.ambient)return base;return clamp(base*.45+.40*Math.sin(x*.009-z*3.2-this.time*.95)+.13*Math.sin(x*.018+z*4-this.time*.64),-1.3,1.5)}
 drag(a,b){
  if(this.reduced||!this.viewport||![a.sx,a.sy,b.sx,b.sy].every(Number.isFinite))return;
  const dx=b.sx-a.sx,dy=b.sy-a.sy,n=dx*dx+dy*dy;if(!n)return;
  const view=this.viewport;
  for(const t of this.tufts){const p=this.project(t,view),radius=clamp(p.h*.34,25,62);let distance=Infinity;
   for(const u of [.35,.60,.85]){const point=this.canopyPoint(t,p,u),along=clamp(((point.x-a.sx)*dx+(point.y-a.sy)*dy)/n,0,1);distance=Math.min(distance,Math.hypot(point.x-a.sx-dx*along,point.y-a.sy-dy*along))}
   if(distance>=radius)continue;const weight=(1-distance/radius)**2;
   // Deposit a bounded air disturbance, never directly jump blade position or velocity.
   t.air=clamp(t.air+(dx+dy*.18)/Math.max(80,view.width*.18)*weight*1.8,-.42,.42);
  }
  const last=this.lastWake,span=(b.t-a.t)/1000,speed=Number.isFinite(span)&&span>0?Math.sqrt(n)/span:Math.sqrt(n)*60;
  if(!last||Math.hypot(b.sx-last.x,b.sy-last.y)>24||this.time-last.time>.12){
   const wake={x:(a.sx+b.sx)*.5,y:(a.sy+b.sy)*.5,direction:Math.sign(dx)||Math.sign(dy)||1,strength:.04*Math.tanh(speed/500),born:this.time};this.wakes.push(wake);if(this.wakes.length>10)this.wakes.shift();this.lastWake={x:b.sx,y:b.sy,time:this.time};
  }
 }
 step(dt=1/60){
  if(this.reduced)return;dt=clamp(dt,0,1/30);this.time+=dt;this.wind=this.wind.filter(g=>this.time-g.born<g.life);this.wakes=this.wakes.filter(g=>this.time-g.born<.85);
  const airDecay=Math.exp(-dt/.24),airFollow=1-Math.exp(-dt/.065);
  for(const t of this.tufts){
   t.air*=airDecay;t.airFiltered+=(t.air-t.airFiltered)*airFollow;
   let wakeForce=0;
   if(this.viewport&&this.wakes.length){const p=this.project(t,this.viewport),q=this.canopyPoint(t,p,.68);for(const g of this.wakes){const age=this.time-g.born,radius=42+age*55,dx=(q.x-g.x-g.direction*age*80)/radius,dy=(q.y-g.y)/radius;wakeForce+=g.direction*g.strength*Math.exp(-(dx*dx+dy*dy)*2)*Math.sin(Math.PI*age/.85)**2}}
   const target=clamp(this.sampleWind(t.x,t.z)*.10+t.airFiltered*.74+wakeForce,-.30,.30),w=t.frequency;
   t.velocity+=(w*w*(target-t.bend)-2*t.damping*w*t.velocity)*dt;t.bend=clamp(t.bend+t.velocity*dt,-.32,.32);
   const tipTarget=clamp(t.bend*1.12,-.35,.35),tipW=9.0;
   t.headVelocity+=(tipW*tipW*(tipTarget-t.head)-2*.70*tipW*t.headVelocity)*dt;t.head=clamp(t.head+t.headVelocity*dt,-.37,.37);
  }
 }
 setReduced(value){super.setReduced(value);if(value){this.wakes=[];this.lastWake=null;for(const t of this.tufts)t.kick=t.air=t.airFiltered=t.headVelocity=0}}
 textureForScene(image,t,p,view,scene){
  if(scene!=='day')return super.textureForScene(image,t,p,view,scene);
  if(!this.dayTextures)this.dayTextures=new WeakMap();if(this.dayTextures.has(image))return this.dayTextures.get(image);
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d');g.drawImage(image,0,0);g.globalCompositeOperation='source-atop';const shade=g.createLinearGradient(0,0,0,c.height);shade.addColorStop(0,'rgba(85,116,88,0)');shade.addColorStop(.32,'rgba(85,116,88,0)');shade.addColorStop(.60,'rgba(85,116,88,.12)');shade.addColorStop(.83,'rgba(75,106,83,.25)');shade.addColorStop(1,'rgba(75,106,83,.28)');g.fillStyle=shade;g.fillRect(0,0,c.width,c.height);this.dayTextures.set(image,c);return c;
 }
 trimmedBase(image,level){if(!this.trimCache)this.trimCache=new WeakMap();let levels=this.trimCache.get(image);if(!levels){levels=[];this.trimCache.set(image,levels)}if(levels[level])return levels[level];const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d');g.drawImage(image,0,0);g.globalCompositeOperation='destination-in';const fade=g.createLinearGradient(0,0,0,c.height),shift=level*.025;fade.addColorStop(0,'white');fade.addColorStop(.59+shift,'white');fade.addColorStop(.73+shift,'rgba(255,255,255,.32)');fade.addColorStop(.88+shift,'transparent');fade.addColorStop(1,'transparent');g.fillStyle=fade;g.fillRect(0,0,c.width,c.height);levels[level]=c;return c}
 draw(ctx,width,height,textures,groundY,scene='day'){
  const view=this.layout(width,height,groundY);this.viewport=view;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // Soft shared ground contact, never a separate dark oval under each bunch.
  for(let i=0;i<18;i++){const z=i/17,p=this.project({x:450,z,size:92+z*245,width:1},view);ctx.save();ctx.translate(p.x,p.root+2);ctx.scale(1,.15);const r=view.patchWidth*(.08+.05*z),g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'rgba(87,103,70,.020)');g.addColorStop(1,'rgba(87,103,70,0)');ctx.fillStyle=g;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore()}
  const items=[];
  for(const t of this.tufts){const p=this.project(t,view),margin=p.h*.9;
   if(p.x+p.w*.5+margin<0||p.x-p.w*.5-margin>width||p.root<0||p.root-p.h>height)continue;
   const source=textures[t.sprite*4+t.tone]||textures[t.tone];if(!source)continue;let im=this.textureForScene(source,t,p,view,scene);if(p.x>width*.62&&p.root>view.groundY-view.patchHeight*.16)im=this.trimmedBase(im,t.id%3);
   items.push({t,p,image:im,alpha:t.alpha*this.canopyWeight(t)*(.84+.16*t.z)});
  }
  if(!this.gpuFailed){try{if(!this.grassMesh)this.grassMesh=new GrassMesh();this.grassMesh.draw(ctx,items,view,this);ctx.restore();return}catch(e){this.gpuFailed=true;if(this.grassMesh)this.grassMesh.dispose();this.grassMesh=null}}
  ctx.imageSmoothingQuality='low';
  for(const {t,p,image:im,alpha} of items){
   ctx.globalAlpha=alpha;
   const slices=width<=600?6:10,sourceH=im.height/slices;
   for(let i=0;i<slices;i++){const a=this.canopyPoint(t,p,1-i/slices),b=this.canopyPoint(t,p,1-(i+1)/slices),height=b.y-a.y;if(height<=.05)continue;ctx.save();ctx.transform(1,0,(b.x-a.x)/height,1,a.x-p.w*.5,a.y);ctx.drawImage(im,0,i*sourceH,im.width,sourceH,0,0,p.w,height+.35);ctx.restore()}
  }
  ctx.restore();
 }
 dispose(){if(this.grassMesh)this.grassMesh.dispose();this.grassMesh=null;super.dispose()}
 get active(){return !this.reduced&&(this.ambient||this.wind.length>0||this.wakes.length>0||this.tufts.some(t=>Math.abs(t.bend)+Math.abs(t.velocity)+Math.abs(t.head)+Math.abs(t.headVelocity)+Math.abs(t.air)+Math.abs(t.airFiltered)>.0001))}
}
