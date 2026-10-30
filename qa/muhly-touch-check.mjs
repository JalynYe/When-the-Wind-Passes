import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../dist/',import.meta.url)),out=fileURLToPath(new URL('./',import.meta.url));
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE_PATH?{executablePath:process.env.CHROME_EXECUTABLE_PATH}:{})});
const errors=[],missing=[];
try{
 const page=await browser.newPage({viewport:{width:1200,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://muhly.local/**',async route=>{
  const u=new URL(route.request().url()),path=join(root,decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
  try{let body=await readFile(path);if(u.pathname==='/app.js')body=Buffer.from(body.toString()+"\nwindow.__touchReset=()=>{sim.ambient=false;sim.wind=[];for(const t of sim.tufts)t.bend=t.velocity=t.head=0;for(const l of sim.sweptLayers)for(const n of l.nodes)n.bend=n.velocity=n.head=n.touch=0};window.__muhlyQA=()=>({kind:sim.kind,sweptBend:sim.sweptLayers?.flatMap(l=>l.nodes.map(n=>n.bend)),time:sim.time,count:sim.tufts?.length,reduced:sim.reduced,wind:sim.wind.length,roots:sim.tufts?.slice(0,4).map(t=>[t.x,t.rootY]),bend:sim.tufts?.map(t=>t.bend),samples:[250,450,650].map(x=>sim.sampleWind?.(x,.5))});");await route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[extname(path)]||'application/octet-stream'})}
  catch{missing.push(u.pathname);await route.fulfill({status:404,body:'Missing'})}
 });
 await page.goto('http://muhly.local/',{timeout:60000});await page.locator('main[data-scene]').waitFor();if(await page.locator('#weather button[data-scene=day]').count())await page.locator('#weather button[data-scene=day]').click();await page.getByRole('button',{name:'粉黛乱子草'}).click();await page.waitForTimeout(600);
 assert.equal((await page.evaluate(()=>window.__muhlyQA())).kind,'muhly');
 await page.screenshot({timeout:60000,path:join(out,'muhly-field-desktop.png')});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);
 await page.screenshot({timeout:60000,path:join(out,'muhly-field-mobile.png')});
 const fit=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,controls:[...document.querySelectorAll('button')].every(b=>{const r=b.getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})}));
 assert.equal(fit.overflow,false);assert.equal(fit.controls,true);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>window.__touchReset());
 const client=await page.context().newCDPSession(page);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:130,y:450}]});
 for(let i=1;i<=8;i++){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:130+i*8,y:450+i*2}]});await page.waitForTimeout(20)}
 const touch=await page.evaluate(()=>window.__muhlyQA());await page.screenshot({timeout:60000,path:join(out,'muhly-touch-motion.png')});
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});


 const gestureResults=[];
 for(const [name,points,pause] of [['slow',[[135,430],[150,434],[165,438],[180,442],[195,446]],65],['fast',[[135,430],[165,438],[195,446]],12],['vertical',[[175,400],[175,425],[175,450],[175,475],[175,500]],40]]){
  await page.evaluate(()=>window.__touchReset());await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:points[0][0],y:points[0][1]}]});
  let peak=0,active=0;
  for(const [x,y] of points.slice(1)){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await page.waitForTimeout(pause);const state=await page.evaluate(()=>window.__muhlyQA());peak=Math.max(peak,...state.sweptBend.map(Math.abs));active=Math.max(active,state.sweptBend.filter(v=>Math.abs(v)>.003).length)}
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  console.log(JSON.stringify({gesture:name,peak,active}));assert.ok(peak>.003&&peak<=.800001,name+' has bounded local motion');assert.ok(active<35,name+' affects a small part of the 260 nodes');
  await page.waitForTimeout(1800);const state=await page.evaluate(()=>window.__muhlyQA()),remaining=Math.max(...state.sweptBend.map(Math.abs));assert.ok(remaining<.015,name+' recovers after release');gestureResults.push({name,peak,active,remaining});
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({fit,gestureResults,touchMaxBend:Math.max(...touch.bend.map(Math.abs)),layerMaxBend:Math.max(...touch.sweptBend.map(Math.abs)),errors,missing}));
}finally{await browser.close()}
