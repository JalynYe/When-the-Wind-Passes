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
 const page=await browser.newPage({viewport:{width:1200,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://muhly.local/**',async route=>{
  const u=new URL(route.request().url()),path=join(root,decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
  try{let body=await readFile(path);if(u.pathname==='/app.js')body=Buffer.from(body.toString()+"\nwindow.__muhlyQA=()=>({kind:sim.kind,time:sim.time,count:sim.tufts?.length,reduced:sim.reduced,wind:sim.wind.length,roots:sim.tufts?.slice(0,4).map(t=>[t.x,t.rootY]),bend:sim.tufts?.map(t=>t.bend),samples:[250,450,650].map(x=>sim.sampleWind?.(x,.5))});");await route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[extname(path)]||'application/octet-stream'})}
  catch{missing.push(u.pathname);await route.fulfill({status:404,body:'Missing'})}
 });
 await page.goto('http://muhly.local/');await page.locator('#weather[data-next]').waitFor();for(let i=0;i<3&&await page.locator('main').getAttribute('data-scene')!=='day';i++)await page.locator('#weather').click();await page.getByRole('button',{name:'粉黛乱子草'}).click();await page.waitForTimeout(600);
 assert.equal((await page.evaluate(()=>window.__muhlyQA())).kind,'muhly');
 await page.screenshot({path:join(out,'muhly-field-desktop.png')});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);
 await page.screenshot({path:join(out,'muhly-field-mobile.png')});
 const fit=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,controls:[...document.querySelectorAll('button')].every(b=>{const r=b.getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})}));
 assert.equal(fit.overflow,false);assert.equal(fit.controls,true);
 // Record the live canvas onto a matching sky backdrop; scene motion is copied unchanged.
 const mime=await page.evaluate(()=>{
  const source=document.querySelector('canvas'),copy=document.createElement('canvas');copy.width=390;copy.height=844;
  const g=copy.getContext('2d'),stream=copy.captureStream(30),mime=['video/mp4;codecs=avc1.42001E','video/webm;codecs=vp9','video/webm'].find(m=>MediaRecorder.isTypeSupported(m)),rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2400000});
  window.__capture={rec,chunks:[],frames:[],start:performance.now(),done:false};
  rec.ondataavailable=e=>{if(e.data.size)window.__capture.chunks.push(e.data)};
  const draw=t=>{const sky=g.createLinearGradient(0,0,0,844);sky.addColorStop(0,'#c8d7d2');sky.addColorStop(.7,'#e0e4df');sky.addColorStop(1,'#f0e9df');g.fillStyle=sky;g.fillRect(0,0,390,844);g.drawImage(source,0,0,390,844);window.__capture.frames.push(t);if(!window.__capture.done)requestAnimationFrame(draw)};
  requestAnimationFrame(draw);rec.start();return mime;
 });
 await page.waitForTimeout(900);await page.getByRole('button',{name:'轻吹一下'}).click();
 const samples=[];
 for(let i=0;i<12;i++){await page.waitForTimeout(440);samples.push(await page.evaluate(()=>window.__muhlyQA()));if(i===3||i===7)await page.screenshot({path:join(out,`muhly-gust-${i}.png`)})}
 await page.mouse.move(65,510);await page.mouse.down();await page.mouse.move(320,530,{steps:18});await page.mouse.up();await page.waitForTimeout(2200);
 const record=await page.evaluate(async()=>{const c=window.__capture;c.done=true;const data=await new Promise(resolve=>{c.rec.onstop=async()=>{const blob=new Blob(c.chunks,{type:c.rec.mimeType});const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(blob)};c.rec.stop()});const gaps=c.frames.slice(1).map((t,i)=>t-c.frames[i]).sort((a,b)=>a-b);return {data,median:gaps[Math.floor(gaps.length*.5)],p95:gaps[Math.floor(gaps.length*.95)],seconds:(c.frames.at(-1)-c.frames[0])/1000}});
 const extension=mime.startsWith('video/mp4')?'mp4':'webm';await writeFile(join(out,`muhly-wind-preview.${extension}`),Buffer.from(record.data,'base64'));
 const strip=await page.evaluate(async()=>{const video=document.createElement('video');video.muted=true;video.src=URL.createObjectURL(new Blob(window.__capture.chunks,{type:window.__capture.rec.mimeType}));await new Promise(resolve=>{video.onloadeddata=resolve;video.load()});const c=document.createElement('canvas');c.width=585;c.height=892;const g=c.getContext('2d');g.fillStyle='#eee9e5';g.fillRect(0,0,c.width,c.height);for(const [i,t] of [1,2.2,3.3,4.4,6,8].entries()){await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=Math.min(t,video.duration-.1)});const x=i%3*195,y=Math.floor(i/3)*446;g.fillStyle='#485655';g.font='13px sans-serif';g.fillText(t+' s',x+8,y+17);g.drawImage(video,x,y+24,195,422)}URL.revokeObjectURL(video.src);return c.toDataURL('image/png').split(',')[1]});await writeFile(join(out,'muhly-motion-frames.png'),Buffer.from(strip,'base64'));
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(120);assert.ok((await page.evaluate(()=>window.__muhlyQA())).bend.every(v=>v===0));
 const reducedA=await page.locator('canvas').evaluate(c=>c.toDataURL());await page.getByRole('button',{name:'轻吹一下'}).click();await page.waitForTimeout(300);assert.equal(await page.locator('canvas').evaluate(c=>c.toDataURL()),reducedA);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'重新长满'}).click();
 const state=await page.evaluate(()=>window.__muhlyQA());assert.equal(state.wind,0);
 await page.locator('button[data-species="ginkgo"]').click();await page.waitForTimeout(100);await page.locator('button[data-species="muhly"]').click();await page.waitForTimeout(100);
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 const report={fit,tufts:state.count,preview:`muhly-wind-preview.${extension}`,recordSeconds:record.seconds,frameMedianMs:record.median,frameP95Ms:record.p95,errors,missing,gustSamples:samples.map(s=>({time:s.time,wind:s.samples}))};
 await writeFile(join(out,'muhly-field-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({...report,gustSamples:undefined}));
}finally{await browser.close()}
