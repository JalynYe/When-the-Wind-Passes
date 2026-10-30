// A single silent gesture demonstrates the same local wind as the user's swipe.
export class SwipeHint {
 constructor(storage){this.storage=storage;this.state='waiting';this.time=0;this.points=[];try{if(storage&&storage.getItem('tree-swipe-hint-seen')==='1')this.state='done'}catch{}}
 remember(){try{if(this.storage)this.storage.setItem('tree-swipe-hint-seen','1')}catch{}}
 dismiss(){this.state='done';this.points=[];this.remember()}
 start(sim,reduced=false){if(this.state!=='waiting')return false;if(reduced||sim.isGrass){this.state='done';return false}let leaf=null,distance=Infinity;for(const l of sim.leaves){if(l.state!=='attached'||l.layer==='back')continue;const d=Math.hypot(l.x-650,l.y-350);if(d<distance){leaf=l;distance=d}}if(!leaf){this.state='done';return false}this.center={x:leaf.x,y:leaf.y-leaf.size*.2};this.state='playing';this.time=0;this.points=[];this.remember();return true}
 position(t){const u=Math.max(0,Math.min(1,t/1.05)),p=u*u*(3-2*u);return{x:this.center.x-54+108*p,y:this.center.y+14-28*p-15*Math.sin(p*Math.PI)}}
 step(dt,sim){if(!this.active)return;const before=this.time;this.time+=dt;if(before<1.05){const a=this.position(before),b=this.position(this.time),strength=Math.sin(Math.PI*Math.min(1,this.time/1.05));sim.emit(a,b,{x:400*strength,y:-150*strength});this.points.push({x:b.x,y:b.y,at:this.time})}this.points=this.points.filter(p=>this.time-p.at<.38);if(this.time>=1.6){this.state='done';this.points=[]}}
 draw(ctx,ox,oy,scale,moon){if(this.points.length<2)return;ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.lineWidth=1.3/scale;ctx.lineCap='round';const color=moon?'214,231,220':'66,102,78',fade=Math.min(1,this.time/.18);for(let i=1;i<this.points.length;i++){const a=this.points[i-1],b=this.points[i],alpha=Math.max(0,1-(this.time-b.at)/.38)*.3*fade;ctx.strokeStyle=`rgba(${color},${alpha})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.restore()}
 get active(){return this.state==='playing'}
}
