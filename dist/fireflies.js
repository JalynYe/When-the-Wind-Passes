// A small warm-season population, kept near sheltered lower vegetation.
export class Fireflies {
 constructor(){this.flies=[];this.time=0;this.kind=null}
 configure(kind,night){this.kind=night&&['willow','jacaranda'].includes(kind)?kind:null;this.reset()}
 reset(){this.time=0;this.flies=[];if(!this.kind)return;const count=this.kind==='willow'?10:7;for(let i=0;i<count;i++){const x=190+((i*173+83)%520),y=495+((i*79+37)%213);this.flies.push({id:i,homeX:x,homeY:y,x,y,vx:0,vy:0,phase:i*2.399,back:i%3===0})}}
 step(dt,reduced){if(reduced)return;this.time+=dt;for(const f of this.flies){const x=f.homeX+Math.sin(this.time*.28+f.phase)*27,y=f.homeY+Math.sin(this.time*.39+f.phase*1.7)*17;f.vx+=((x-f.x)*.75-f.vx*1.6)*dt;f.vy+=((y-f.y)*.75-f.vy*1.6)*dt;f.x+=f.vx*dt;f.y+=f.vy*dt}}
 disturb(a,b,reduced){if(reduced)return;const dx=b.x-a.x,dy=b.y-a.y,n=dx*dx+dy*dy;for(const f of this.flies){const t=n?Math.max(0,Math.min(1,((f.x-a.x)*dx+(f.y-a.y)*dy)/n)):0,x=f.x-a.x-t*dx,y=f.y-a.y-t*dy,d=Math.hypot(x,y);if(d>85)continue;const k=(1-d/85)*32,angle=d>1?Math.atan2(y,x):f.phase;f.vx=Math.max(-60,Math.min(60,f.vx+Math.cos(angle)*k));f.vy=Math.max(-60,Math.min(60,f.vy+Math.sin(angle)*k-12))}}
 brightness(f,reduced){return reduced?.32:.06+.94*Math.pow(Math.max(0,Math.sin(this.time*(.78+f.id*.023)+f.phase)),7)}
 draw(ctx,ox,oy,scale,back,reduced){if(!this.flies.length)return;ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);for(const f of this.flies){if(f.back!==back)continue;const a=this.brightness(f,reduced)*(back?.64:1),r=back?6:9,g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,r);g.addColorStop(0,`rgba(222,240,151,${a*.35})`);g.addColorStop(.3,`rgba(202,226,123,${a*.13})`);g.addColorStop(1,'rgba(202,226,123,0)');ctx.fillStyle=g;ctx.fillRect(f.x-r,f.y-r,r*2,r*2);ctx.fillStyle=`rgba(235,247,178,${a})`;ctx.beginPath();ctx.ellipse(f.x,f.y,back?.85:1.25,back?1:1.65,.35,0,Math.PI*2);ctx.fill()}ctx.restore()}
 get active(){return this.flies.length>0}
}
