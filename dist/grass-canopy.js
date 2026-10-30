const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function distance(x,y,a,b){const dx=b.sx-a.sx,dy=b.sy-a.sy,n=dx*dx+dy*dy,t=n?clamp(((x-a.sx)*dx+(y-a.sy)*dy)/n,0,1):0;return Math.hypot(x-a.sx-dx*t,y-a.sy-dy*t)}
// A near-view foliage surface. Local deformation is spatial, not whole-image translation.
export class CanopySurface{
 constructor(){this.reset()}
 reset(){this.cols=12;this.rows=14;this.time=0;this.gusts=[];this.nodes=[];for(let y=0;y<=this.rows;y++)for(let x=0;x<=this.cols;x++)this.nodes.push({u:x/this.cols,v:y/this.rows,x:0,y:0,vx:0,vy:0,kx:0,ky:0,edge:x===0||x===this.cols||y===0||y===this.rows});this.view=null}
 setReduced(){this.time=0;this.gusts=[];for(const n of this.nodes)n.x=n.y=n.vx=n.vy=n.kx=n.ky=0}
 resize(width,height){this.view={width,height,pad:36}}
 position(n){const {width,height,pad}=this.view;return{x:-pad+n.u*(width+pad*2)+n.x,y:-pad+n.v*(height+pad*2)+n.y}}
 drag(a,b){if(!this.view||![a.sx,a.sy,b.sx,b.sy].every(Number.isFinite))return;const {width}=this.view,r=clamp(width*.15,65,135),dx=b.sx-a.sx,dy=b.sy-a.sy;for(const n of this.nodes){if(n.edge)continue;const p=this.position(n),d=distance(p.x,p.y,a,b);if(d>=r)continue;const w=(1-d/r)**2;n.kx=clamp(n.kx+dx*w*5,-170,170);n.ky=clamp(n.ky+dy*w*4,-130,130)}}
 breeze(){this.gusts.push(this.time)}
 step(dt,ambient=true){this.time+=dt;this.gusts=this.gusts.filter(t=>this.time-t<6);for(const n of this.nodes){if(n.edge)continue;const phase=n.u*7-n.v*4-this.time*.8;let tx=ambient?5*Math.sin(phase)+2*Math.sin(n.v*9-this.time*.43):0,ty=ambient?2*Math.sin(phase+.8):0;for(const g of this.gusts){const d=(n.u-(this.time-g)*.3+.3)/.25;tx+=12*Math.exp(-d*d*2);ty-=3*Math.exp(-d*d*2)}n.vx+=n.kx;n.vy+=n.ky;n.kx=n.ky=0;n.vx+=(20*(tx-n.x)-8.6*n.vx)*dt;n.vy+=(20*(ty-n.y)-8.6*n.vy)*dt;n.x=clamp(n.x+n.vx*dt,-28,28);n.y=clamp(n.y+n.vy*dt,-22,22)}}
 triangle(ctx,im,s,d,crop){
  const [p,q,r]=s,[a,b,c]=d,det=(q.x-p.x)*(r.y-p.y)-(r.x-p.x)*(q.y-p.y);if(!det)return;
  const m0=((b.x-a.x)*(r.y-p.y)-(c.x-a.x)*(q.y-p.y))/det,m2=((c.x-a.x)*(q.x-p.x)-(b.x-a.x)*(r.x-p.x))/det,m1=((b.y-a.y)*(r.y-p.y)-(c.y-a.y)*(q.y-p.y))/det,m3=((c.y-a.y)*(q.x-p.x)-(b.y-a.y)*(r.x-p.x))/det;
  ctx.save();const cx=(a.x+b.x+c.x)/3,cy=(a.y+b.y+c.y)/3;ctx.beginPath();for(let i=0;i<3;i++){const t=d[i],dx=t.x-cx,dy=t.y-cy,l=Math.hypot(dx,dy)||1,x=t.x+dx/l*.45,y=t.y+dy/l*.45;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.clip();ctx.transform(m0,m1,m2,m3,a.x-m0*p.x-m2*p.y,a.y-m1*p.x-m3*p.y);const sx=Math.max(0,crop.x-3),sy=Math.max(0,crop.y-3),sw=Math.min(im.width-sx,crop.w+6),sh=Math.min(im.height-sy,crop.h+6);ctx.drawImage(im,sx,sy,sw,sh,sx,sy,sw,sh);ctx.restore();
 }
 draw(ctx,im,width,height,scene){if(!im)return;if(!this.view||this.view.width!==width||this.view.height!==height)this.resize(width,height);const pad=this.view.pad,scale=Math.max((width+pad*2)/im.width,(height+pad*2)/im.height),sw=(width+pad*2)/scale,sh=(height+pad*2)/scale,ox=(im.width-sw)/2,oy=(im.height-sh)/2;
  const source=n=>({x:ox+n.u*sw,y:oy+n.v*sh}),dest=this.nodes.map(n=>this.position(n));ctx.save();
  for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){const i=y*(this.cols+1)+x,j=i+1,k=i+this.cols+1,l=k+1,a=source(this.nodes[i]),b=source(this.nodes[j]),c=source(this.nodes[k]),d=source(this.nodes[l]),crop={x:a.x,y:a.y,w:b.x-a.x,h:c.y-a.y};this.triangle(ctx,im,[a,b,c],[dest[i],dest[j],dest[k]],crop);this.triangle(ctx,im,[b,d,c],[dest[j],dest[l],dest[k]],crop)}
  if(scene!=='day'){ctx.fillStyle=scene==='moon'?'rgba(14,38,48,.60)':'rgba(56,83,75,.19)';ctx.fillRect(0,0,width,height)}ctx.restore();
 }
 get active(){return this.gusts.length>0||this.nodes.some(n=>Math.abs(n.x)+Math.abs(n.y)+Math.abs(n.vx)+Math.abs(n.vy)+Math.abs(n.kx)+Math.abs(n.ky)>.001)}
}
