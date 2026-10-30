import {softLayer} from './soft-layer.js?v=20261030ios';
// Rain lives in screen space so its depth, ground and speed survive any viewport.
const rainRandom=(i)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
export class RainScene {
 constructor(){this.time=0;this.width=0;this.height=0;this.drops=[];this.impacts=[];this.wind=0;this.spawn=0;this.seed=0;this.backdrop=null;this.pools=[]}
 resize(width,height,ground){this.width=width;this.height=height;this.ground=Math.max(height*.65,Math.min(height*.84,ground));this.drops=Array.from({length:Math.min(460,Math.round(width*height/2100))},(_,i)=>this.drop(i,true));this.impacts=[];this.backdrop=null}
 drop(i,initial=false){const z=rainRandom(i*5+1),layer=z<.5?0:z<.91?1:2;return{x:rainRandom(i*5+2)*(this.width+100)-50,y:initial?rainRandom(i*5+3)*this.height:-40-rainRandom(i*5+3)*100,layer,speed:[260,490,740][layer]*(.8+rainRandom(i*5+4)*.4),length:[8,17,28][layer]*(.6+rainRandom(i*5+5)*.8),end:this.ground+rainRandom(i*7+2)*(this.height-this.ground),id:i}}
 step(dt,reduced=false){if(reduced)return;this.time+=dt;this.wind=12+Math.sin(this.time*.38)*13+Math.sin(this.time*.13)*8;
 for(let i=0;i<this.drops.length;i++){const d=this.drops[i];d.prevY=d.y;d.x+=this.wind*(.5+d.layer*.4)*dt;d.y+=d.speed*dt;if(d.y>d.end){if(d.layer===1&&this.impacts.length<45)this.impacts.push({x:d.x,y:d.end,age:0,water:this.inWater(d.x,d.end),size:.5+(d.end-this.ground)/(this.height-this.ground)});this.drops[i]=this.drop(++this.seed+900,false)}}
 for(const p of this.impacts)p.age+=dt;this.impacts=this.impacts.filter(p=>p.age<1.1)}
 inWater(){return false}

 makeBackdrop(){const c=document.createElement('canvas');c.width=Math.round(this.width);c.height=Math.round(this.height);const g=c.getContext('2d'),w=this.width,h=this.height,ground=this.ground;
 const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#8d9f9e');sky.addColorStop(.48,'#b6c5bf');sky.addColorStop(1,'#84958a');g.fillStyle=sky;g.fillRect(0,0,w,h);
 // Soft, irregular distant crowns, drawn once rather than blurred every frame.
 for(let band=0;band<2;band++){const layer=softLayer(w,h,band?7:15,d=>{d.globalAlpha=band?.2:.14;d.fillStyle=band?'#45665a':'#59796a';for(let i=0;i<16;i++){const x=(i/14)*w-w*.05,y=ground-h*(band?.08:.15)+rainRandom(i+30)*h*.08;d.beginPath();d.ellipse(x,y,w*(.035+rainRandom(i+22)*.045),h*(.07+rainRandom(i+40)*.09),0,0,Math.PI*2);d.fill()}});g.drawImage(layer,0,0,w,h)}
 const mist=g.createLinearGradient(0,ground-h*.25,0,ground+h*.05);mist.addColorStop(0,'rgba(204,215,207,0)');mist.addColorStop(.63,'rgba(204,215,207,.57)');mist.addColorStop(1,'rgba(204,215,207,0)');g.fillStyle=mist;g.fillRect(0,ground-h*.25,w,h*.3);
 const floor=g.createLinearGradient(0,ground-25,0,h);floor.addColorStop(0,'rgba(116,135,121,0)');floor.addColorStop(.24,'rgba(104,123,108,.58)');floor.addColorStop(1,'#6e8275');g.fillStyle=floor;g.fillRect(0,ground-25,w,h-ground+25);
 // Broken horizontal marks suggest damp earth without a hard horizon.
 for(let i=0;i<210;i++){const x=rainRandom(i+700)*w,y=ground+rainRandom(i+1300)*(h-ground);g.strokeStyle=i%3?'rgba(47,78,59,.06)':'rgba(209,222,208,.1)';g.lineWidth=.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+2+rainRandom(i+1900)*17,y);g.stroke()}
 this.backdrop=c}
 background(ctx,reduced=false){if(!this.backdrop)this.makeBackdrop();ctx.drawImage(this.backdrop,0,0,this.width,this.height);if(!reduced)this.streaks(ctx,0);}
 streaks(ctx,layer){ctx.save();ctx.lineCap='round';ctx.lineWidth=[.55,.8,1.25][layer];ctx.strokeStyle=['rgba(220,233,225,.2)','rgba(229,241,233,.37)','rgba(235,245,237,.26)'][layer];ctx.beginPath();for(const d of this.drops){if(d.layer!==layer||d.leafHit)continue;const dx=this.wind*(.5+layer*.4)/d.speed*d.length;ctx.moveTo(d.x-dx,d.y-d.length);ctx.lineTo(d.x,d.y)}ctx.stroke();ctx.restore()}
 drawImpacts(ctx,reduced=false){if(reduced)return;ctx.save();for(const p of this.impacts){const t=p.age/1.1,s=p.size;
 // Perspective-flattened wavelets spread from each actual rain landing point.
 for(let ring=0;ring<2;ring++){const q=t-ring*.16;if(q<=0)continue;const r=(1+18*Math.pow(q,.72))*s,alpha=Math.min(1,q*12)*Math.pow(1-q,1.6)*(ring?.19:.38);ctx.globalAlpha=alpha;ctx.lineWidth=ring?.5:.7;ctx.strokeStyle='#e0ece0';ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.23,0,.08,Math.PI-.08);ctx.stroke();ctx.globalAlpha=alpha*.6;ctx.strokeStyle='#395a4a';ctx.beginPath();ctx.ellipse(p.x,p.y+.5,r,r*.23,0,Math.PI+.08,Math.PI*2-.08);ctx.stroke()}
 if(p.age<.22){const q=p.age/.22,r=q*3*s,y=p.y-Math.sin(q*Math.PI)*2.5*s;ctx.globalAlpha=(1-q)*.28;ctx.strokeStyle='#deebe0';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.x-r,y);ctx.lineTo(p.x-r-.8,y-1);ctx.moveTo(p.x+r,y);ctx.lineTo(p.x+r+.8,y-1);ctx.stroke()}}ctx.restore()}

 foreground(ctx,reduced=false){this.drawImpacts(ctx,reduced);if(!reduced){this.streaks(ctx,1);this.streaks(ctx,2)}}
 reset(){this.time=0;this.impacts=[];this.seed=0;if(this.width)this.resize(this.width,this.height,this.ground)}
}
