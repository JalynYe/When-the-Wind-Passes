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
  try{let body=await readFile(path);if(u.pathname==='/app.js')body=Buffer.from(body.toString()+"\nwindow.__muhlyQA=()=>({kind:sim.kind,time:sim.time,count:sim.tufts?.length,reduced:sim.reduced,wind:sim.wind.length,roots:sim.tufts?.slice(0,4).map(t=>[t.x,t.rootY]),bend:sim.tufts?.map(t=>t.bend),samples:[250,450,650].map(x=>sim.sampleWind?.(x,.5))});");await route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[extname(path)]||'application/octet-stream'})}
  catch{missing.push(u.pathname);await route.fulfill({status:404,body:'Missing'})}
 });
 await page.goto('http://muhly.local/',{timeout:60000});await page.locator('#weather[data-next]').waitFor();for(let i=0;i<3&&await page.locator('main').getAttribute('data-scene')!=='day';i++)await page.locator('#weather').click();await page.getByRole('button',{name:'粉黛乱子草'}).click();await page.waitForTimeout(600);
 assert.equal((await page.evaluate(()=>window.__muhlyQA())).kind,'muhly');
 await page.screenshot({timeout:60000,path:join(out,'muhly-field-desktop.png')});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);
 await page.screenshot({timeout:60000,path:join(out,'muhly-field-mobile.png')});
 const fit=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,controls:[...document.querySelectorAll('button')].every(b=>{const r=b.getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})}));
 assert.equal(fit.overflow,false);assert.equal(fit.controls,true);
 console.log(JSON.stringify({fit,errors,missing}));
}finally{await browser.close()}
