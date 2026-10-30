const instrumentScale=[48,60,64,67,60,64,72,67,64,60];
function nearSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,n=dx*dx+dy*dy,t=n?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/n)):0;return {distance:Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t),t}}
export class BranchInstrument {
 constructor(){this.bound=null;this.zones=[];this.cooldowns=new Map()}
 bind(sim){if(this.bound===sim)return;this.bound=sim;this.cooldowns.clear();this.zones=[];if(sim.kind==='muhly'||sim.isGrass||!sim.branches)return;if(sim.kind==='willow'){const leaders=sim.branches.filter(b=>b.parent===0);for(const b of sim.branches){if(b.hidden||b.depth!==2)continue;const parent=sim.branches[b.parent],group=leaders.indexOf(parent);if(group<0)continue;this.zones.push({branch:b,key:group,midi:instrumentScale[group%instrumentScale.length],radius:18})}return}const branches=sim.branches.filter(b=>b.parent===0&&b.width>=4).slice(0,10);branches.sort((a,b)=>b.width-a.width||a.restOrigin.y-b.restOrigin.y);for(let i=0;i<branches.length;i++)this.zones.push({branch:branches[i],key:i,midi:instrumentScale[Math.min(i,instrumentScale.length-1)]})}
 cross(sim,a,b,time){this.bind(sim);if(sim.kind==='muhly'||sim.isGrass)return this.crossGrass(sim,a,b,time);if(Math.hypot(b.x-a.x,b.y-a.y)<4)return [];const found=[];for(const z of this.zones){let contact=null;for(let i=2;i<=10;i++){const p=sim.point(z.branch,i/10),hit=nearSegment(p,a,b);if(hit.distance<(z.radius||36)&&Math.hypot(p.x-a.x,p.y-a.y)>(z.radius?20:39)&&(!contact||hit.t<contact.t))contact=hit}if(contact&&time-(this.cooldowns.has(z.key)?this.cooldowns.get(z.key):-Infinity)>.7)found.push({key:z.key,midi:z.midi,t:contact.t})}found.sort((a,b)=>a.t-b.t);const unique=[];for(const n of found)if(!unique.some(q=>q.key===n.key))unique.push(n);const notes=unique.slice(0,3);for(const n of notes)this.cooldowns.set(n.key,time);return notes}
 crossGrass(sim,a,b,time){
  if(!sim.viewport||!sim.tufts||![a.sx,a.sy,b.sx,b.sy].every(Number.isFinite)||Math.hypot(b.sx-a.sx,b.sy-a.sy)<4)return [];
  const from={x:a.sx,y:a.sy},to={x:b.sx,y:b.sy},view=sim.viewport,contacts=new Map(),pitches=[48,60,64,67,64,60];
  for(const tuft of sim.tufts){const p=sim.project(tuft,view),key=Math.max(0,Math.min(5,Math.floor(p.x/view.width*6)));if(time-(this.cooldowns.has(key)?this.cooldowns.get(key):-Infinity)<.7)continue;
   for(const u of [.35,.6,.85]){const point=sim.canopyPoint?sim.canopyPoint(tuft,p,u):{x:p.x+p.h*((tuft.rest+tuft.bend)*u*u+(tuft.head-tuft.bend)*u**5),y:p.root-p.h*u},hit=nearSegment(point,from,to),radius=Math.max(9,Math.min(18,p.h*.10));
    if(hit.distance>=radius)continue;const previous=contacts.get(key);if(!previous||hit.t<previous.t)contacts.set(key,{key,midi:pitches[key],t:hit.t});
   }
  }
  const notes=Array.from(contacts.values()).sort((a,b)=>a.t-b.t).slice(0,3);for(const note of notes)this.cooldowns.set(note.key,time);return notes;
 }

}
