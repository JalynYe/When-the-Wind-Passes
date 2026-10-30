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
  try{let body=await readFile(path);if(u.pathname==='/app.js')body=Buffer.from(body.toString()+"\nwindow.__perfStart=()=>{const rows=[];window.__perfRows=rows;window.__inputLags=[];canvas.addEventListener('pointermove',()=>window.__lastInput=performance.now());const draw=sim.draw.bind(sim);sim.draw=(...a)=>{const start=performance.now();draw(...a);rows.push(performance.now()-start);if(window.__lastInput){window.__inputLags.push(performance.now()-window.__lastInput);window.__lastInput=0}}};window.__touchReset=()=>{sim.ambient=false;sim.wind=[];for(const t of sim.tufts)t.bend=t.velocity=t.head=0;for(const l of sim.sweptLayers)for(const n of l.nodes)n.bend=n.velocity=n.head=0};window.__muhlyQA=()=>({kind:sim.kind,sweptBend:sim.sweptLayers?.flatMap(l=>l.nodes.map(n=>n.bend)),time:sim.time,count:sim.tufts?.length,reduced:sim.reduced,wind:sim.wind.length,roots:sim.tufts?.slice(0,4).map(t=>[t.x,t.rootY]),bend:sim.tufts?.map(t=>t.bend),samples:[250,450,650].map(x=>sim.sampleWind?.(x,.5))});");await route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[extname(path)]||'application/octet-stream'})}
  catch{missing.push(u.pathname);await route.fulfill({status:404,body:'Missing'})}
 });
 await page.goto('http://muhly.local/',{timeout:60000});await page.locator('main[data-scene]').waitFor();if(await page.locator('#weather button[data-scene=day]').count())await page.locator('#weather button[data-scene=day]').click();await page.getByRole('button',{name:'粉黛乱子草'}).click();await page.waitForTimeout(600);
 assert.equal((await page.evaluate(()=>window.__muhlyQA())).kind,'muhly');
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>window.__perfStart());await page.mouse.move(110,430);await page.mouse.down();for(let i=0;i<24;i++){await page.mouse.move(110+i*5,430+Math.sin(i*.15)*25);await page.waitForTimeout(12)}await page.mouse.up();await page.waitForTimeout(700);
 const result=await page.evaluate(()=>{const rows=window.__perfRows.slice(5).sort((a,b)=>a-b);const lag=window.__inputLags.sort((a,b)=>a-b);return {inputSamples:lag.length,inputMedianMs:lag[Math.floor(lag.length*.5)],inputP95Ms:lag[Math.floor(lag.length*.95)],frames:rows.length,medianMs:rows[Math.floor(rows.length*.5)],p95Ms:rows[Math.floor(rows.length*.95)]}});console.log(JSON.stringify({result,errors}));
}finally{await browser.close()}
