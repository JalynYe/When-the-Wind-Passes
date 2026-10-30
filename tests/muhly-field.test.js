import test from 'node:test';
import assert from 'node:assert/strict';
import {MuhlyField} from '../dist/muhly-field.js';

test('a broad gust reaches successive regions at successive times',()=>{
 const s=new MuhlyField({ambient:false});s.breeze();const samples=[100,450,800].map(x=>({x,peak:-Infinity,time:0}));
 for(let i=0;i<420;i++){s.step(1/60);for(const p of samples){const w=s.sampleWind(p.x,.5);if(w>p.peak){p.peak=w;p.time=s.time}}}
 assert.ok(samples.every(p=>p.peak>.95));
 assert.ok(samples[1].time-samples[0].time>1.2);assert.ok(samples[2].time-samples[1].time>1.2);
});

test('tufts bend and lag behind the wind while roots stay pinned, then recover',()=>{
 const s=new MuhlyField({ambient:false}),roots=s.tufts.map(t=>[t.x,t.rootY]);s.breeze();let maximum=0,lag=0;
 for(let i=0;i<1100;i++){s.step(1/60);for(const t of s.tufts){maximum=Math.max(maximum,Math.abs(t.bend));lag=Math.max(lag,Math.abs(t.head-t.bend));assert.ok(Number.isFinite(t.bend)&&Math.abs(t.bend)<=.55)}}
 assert.ok(maximum>.1&&lag>.01);assert.deepEqual(s.tufts.map(t=>[t.x,t.rootY]),roots);
 assert.ok(s.tufts.every(t=>Math.abs(t.bend)<.001&&Math.abs(t.velocity)<.001));
});

test('gesture wind stays local in depth and reduced motion holds a stable pose',()=>{
 const s=new MuhlyField({ambient:false});s.emit({x:400,y:400},{x:450,y:435},{x:1200,y:0});
 assert.ok(s.sampleWind(450,.5)>s.sampleWind(450,0)*10);
 s.step(.02);s.setReduced(true);s.breeze();s.emit({x:0,y:300},{x:50,y:300},{x:1000,y:0});
 for(let i=0;i<120;i++)s.step(1/60);
 assert.equal(s.active,false);assert.equal(s.wind.length,0);assert.ok(s.tufts.every(t=>t.bend===0&&t.head===0));
});

test('ambient wind is spatially continuous and reset preserves the field layout',()=>{
 const s=new MuhlyField(),layout=s.tufts.map(t=>[t.x,t.rootY,t.size]);
 assert.ok(Math.abs(s.sampleWind(400,.5)-s.sampleWind(405,.5))<.02);
 for(let i=0;i<180;i++)s.step(1/60);assert.ok(s.tufts.some(t=>Math.abs(t.bend)>.02));
 s.reset();assert.deepEqual(s.tufts.map(t=>[t.x,t.rootY,t.size]),layout);
});

test('the ribbon crosses both screen edges and leaves the lower controls clear',()=>{
 const s=new MuhlyField();
 for(const [width,height,ground] of [[390,844,615],[1200,900,744],[667,375,280]]){
  const view=s.layout(width,height,ground),positions=s.tufts.map(t=>s.project(t,view));
  assert.ok(positions.every(p=>p.root<=ground+view.patchHeight*.151));
  assert.ok(Math.min(...positions.map(p=>p.x-p.w*.5))<0);
  assert.ok(Math.max(...positions.map(p=>p.x+p.w*.5))>width);
  assert.ok(positions.every(p=>p.root-p.h>height*.02));
  assert.ok(Math.max(...positions.map(p=>p.root))<height*.9);
 }
});

test('pointer input in the meadow reaches the wind field and empty margins do not create gusts',()=>{
 const s=new MuhlyField({ambient:false}),width=390,height=844,ground=615;
 const inside=s.fromScreen(195,ground-height*.55*.665,width,height,ground),outside=s.fromScreen(195,35,width,height,ground);
 assert.equal(inside.inside,true);assert.equal(outside.inside,false);
 s.emit(outside,outside,{x:1200,y:0});assert.equal(s.wind.length,0);
 s.emit(inside,inside,{x:1200,y:0});assert.equal(s.wind.length,1);
 assert.ok(s.sampleWind(inside.x,(inside.y-185)/500)>.5);
});

test('dragging the visible canopy bends nearby tufts immediately and respects reduced motion',()=>{
 const s=new MuhlyField({ambient:false}),view=s.layout(390,844,615);
 const t=s.tufts.find(t=>{const p=s.project(t,view);return p.x>100&&p.x<270&&p.root-p.h*.6>250&&p.root-p.h*.6<530});
 const p=s.project(t,view),y=p.root-p.h*.6;
 const a=s.fromScreen(p.x-18,y,390,844,615),b=s.fromScreen(p.x+18,y,390,844,615);
 assert.ok(a.inside&&b.inside);s.drag(a,b,{x:500,y:0});assert.ok(t.bend>.05);
 const roots=s.tufts.map(t=>[t.x,t.rootY]);for(let i=0;i<900;i++)s.step(1/60);
 assert.ok(s.tufts.every(t=>Math.abs(t.bend)<.001));assert.deepEqual(s.tufts.map(t=>[t.x,t.rootY]),roots);
 s.setReduced(true);s.drag(a,b,{x:500,y:0});assert.ok(s.tufts.every(t=>t.bend===0));
});

test('the new flower layers bend locally, recover, and stop with reduced motion',()=>{
 const s=new MuhlyField({ambient:false});s.sweptImage={width:1000,height:400};
 const view=s.layout(390,844,615),layer=s.sweptLayers[4],p=s.sweptRect(layer,view),x=p.x+p.w*.5,y=p.y+p.h/3;
 const a=s.fromScreen(x-12,y,390,844,615),b=s.fromScreen(x+12,y,390,844,615);
 s.drag(a,b,{x:600,y:0});assert.ok(layer.nodes.every(n=>n.bend===0),'touch force starts without a positional jump');s.step(1/60);assert.ok(layer.nodes.some(n=>n.bend>.001));
 assert.equal(layer.nodes.at(-1).bend,0);
 assert.equal(layer.nodes[6].bend,0,'same x far above the touch stays still');
 assert.ok(s.sweptLayers.filter(l=>l!==layer).every(l=>l.nodes.every(n=>n.bend===0)),'occluded layers stay still');
 for(let i=0;i<900;i++)s.step(1/60);
 assert.ok(s.sweptLayers.every(l=>l.nodes.every(n=>Math.abs(n.bend)<.001)));
 s.setReduced(true);s.drag(a,b,{x:600,y:0});s.breeze();s.step(1/60);
 assert.ok(s.sweptLayers.every(l=>l.nodes.every(n=>n.bend===0&&n.velocity===0)));
});

test('finger speed comes from screen motion even when flower coordinates jump',()=>{
 const run=(jump)=>{
  const s=new MuhlyField({ambient:false});s.sweptImage={width:1000,height:400};s.beginGesture();
  const view=s.layout(390,844,615),p=s.sweptRect(s.sweptLayers[4],view),x=p.x+p.w*.5,y=p.y+p.h/3;
  const a={...s.fromScreen(x-12,y,390,844,615),t:0},b={...s.fromScreen(x+12,y,390,844,615),t:60};
  if(jump){a.x=900;b.x=0;a.y=185;b.y=685}
  s.drag(a,b,{x:jump?-9000:9000,y:jump?9000:-9000});
  return s.sweptLayers.flatMap(l=>l.nodes.map(n=>n.touch));
 };
 const stable=run(false),jumped=run(true);assert.deepEqual(jumped,stable);assert.ok(stable.some(v=>v>.1));assert.ok(stable.every(v=>v>=0));
});
