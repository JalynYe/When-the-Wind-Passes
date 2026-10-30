// Small, bounded seasonal interactions in the same world coordinates as the tree.
export class Environment {
 constructor(){this.season='spring';this.weather='clear';this.period='day';this.time=0;this.reset()}
 reset(){this.coats=[];this.particles=[];this.flies=Array.from({length:22},(_,i)=>({x:180+(i*137)%570,y:270+(i*83)%350,vx:0,vy:0,glow:0,phase:i*2.4}));this.bound=null}
 configure(key,value){this[key]=value;this.reset()}
 bind(sim){if(this.bound===sim)return;this.bound=sim;this.coats=sim.leaves.filter((l,i)=>i%Math.max(1,Math.floor(sim.leaves.length/95))===0).slice(0,95).map(l=>({leaf:l,amount:1,cooldown:0}))}
 get active(){return this.weather==='rain'||this.period==='night'||this.particles.length>0||this.coats.some(c=>c.amount<1)}
 touch(a,b,reduced=false){
 const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;
 const near=p=>{const t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t)};
 if(this.season==='winter'||this.weather==='rain')for(const c of this.coats){if(c.amount<.65||near(c.leaf)>48||c.leaf.state!=='attached')continue;c.amount=0;c.cooldown=3;
 if(!reduced)for(let i=0;i<(this.season==='winter'?5:2);i++){if(this.particles.length>=180)break;this.particles.push({x:c.leaf.x,y:c.leaf.y-8,vx:dx*.5+(Math.random()-.5)*65,vy:-25-Math.random()*45,age:0,snow:this.season==='winter',size:2+Math.random()*3})}}
 if(this.period==='night')for(const f of this.flies){if(near(f)>115)continue;const r=Math.hypot(f.x-b.x,f.y-b.y)||1;f.vx=(f.x-b.x)/r*95;f.vy=(f.y-b.y)/r*95-20;f.glow=1}
 }
 step(dt,reduced=false){this.time+=dt;for(const c of this.coats){c.cooldown=Math.max(0,c.cooldown-dt);if(!c.cooldown)c.amount=Math.min(1,c.amount+dt*.07)}
 for(const p of this.particles){p.age+=dt;p.vy+=(p.snow?45:230)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-dt*1.2)}this.particles=this.particles.filter(p=>p.age<3&&p.y<850);
 for(const f of this.flies){f.glow=Math.max(0,f.glow-dt*.4);if(reduced){f.vx=f.vy=0;continue}f.x+=(f.vx+Math.sin(this.time*.7+f.phase)*7)*dt;f.y+=(f.vy+Math.cos(this.time*.8+f.phase)*5)*dt;f.vx*=Math.exp(-dt*1.7);f.vy*=Math.exp(-dt*1.7);f.x=Math.max(90,Math.min(810,f.x));f.y=Math.max(130,Math.min(720,f.y))}}
 draw(ctx,reduced=false){
 if(this.weather==='rain'&&!reduced){ctx.strokeStyle='rgba(132,167,185,.32)';ctx.lineWidth=.9;ctx.beginPath();for(let i=0;i<65;i++){const x=-180+(i*97)%1250,y=((i*139+this.time*340)%1150)-220;ctx.moveTo(x,y);ctx.lineTo(x-5,y+17)}ctx.stroke()}
 if(this.season==='winter'||this.weather==='rain')for(const c of this.coats){const l=c.leaf;if(c.amount<=0||l.state!=='attached')continue;ctx.save();ctx.globalAlpha=c.amount;ctx.translate(l.x,l.y-9);
 if(this.season==='winter'){ctx.fillStyle='#f3f7fa';ctx.shadowColor='#b5cbd5';ctx.shadowBlur=3;ctx.beginPath();ctx.ellipse(0,0,Math.min(17,l.size*.3),4,-.12,0,Math.PI*2);ctx.fill()}
 else{ctx.fillStyle='rgba(184,220,237,.85)';ctx.beginPath();ctx.ellipse(0,7,2.5,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f2fbff';ctx.fillRect(-1,5,1,2)}ctx.restore()}
 for(const p of this.particles){ctx.globalAlpha=Math.max(0,1-p.age/3);ctx.fillStyle=p.snow?'#f7fbff':'#b6dce9';ctx.beginPath();ctx.ellipse(p.x,p.y,p.size,p.snow?p.size*.65:p.size*1.7,0,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
 if(this.period==='night')for(const f of this.flies){const a=.35+.25*Math.sin(this.time*1.8+f.phase)+f.glow*.4,r=13+f.glow*15,g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,r);g.addColorStop(0,`rgba(220,249,143,${a})`);g.addColorStop(1,'rgba(206,246,123,0)');ctx.fillStyle=g;ctx.fillRect(f.x-r,f.y-r,r*2,r*2);ctx.fillStyle=`rgba(243,255,185,${Math.min(1,a+.3)})`;ctx.beginPath();ctx.arc(f.x,f.y,1.6,0,Math.PI*2);ctx.fill()}
 }
}
