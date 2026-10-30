import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {extname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE_PATH});
const root=fileURLToPath(new URL('../dist/',import.meta.url));
try{
 const page=await browser.newPage({viewport:{width:414,height:714},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://mobile.local/**',async route=>{const url=new URL(route.request().url()),path=join(root,url.pathname==='/'?'index.html':url.pathname);try{let body=await readFile(path);if(url.pathname==='/app.js')body=Buffer.from(body.toString()+"\nwindow.__mobileField=sim;window.__mobileReset=()=>{sim.ambient=false;sim.wind=[];for(const l of sim.sweptLayers)for(const n of l.nodes)n.bend=n.head=n.velocity=0};");await route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'}[extname(path)]||'application/octet-stream'})}catch{await route.fulfill({status:404,body:'Missing'})}});
 await page.goto('http://mobile.local/');await page.locator('main[data-scene]').waitFor();await page.getByRole('button',{name:'粉黛乱子草'}).click();await page.waitForTimeout(300);
 // Obtain the actual current simulation after the picker changed.
 await page.evaluate(async()=>{const {MuhlyField}=await import('/muhly-field.js');window.__fieldClass=MuhlyField});
 const metrics=await page.evaluate(()=>{
  const s=new window.__fieldClass({ambient:false}),texture=document.createElement('canvas');texture.width=512;texture.height=200;const g=texture.getContext('2d');g.fillStyle='rgba(190,110,140,.45)';g.fillRect(0,0,512,200);s.sweptImage=texture;
  const view=s.layout(414,714,520),make=()=>{const c=document.createElement('canvas');c.width=414;c.height=714;return c},actual=make(),reference=make(),a=actual.getContext('2d'),r=reference.getContext('2d');
  for(let i=0;i<s.sweptLayers.length;i++){const l=s.sweptLayers[i],p=s.sweptRect(l,view);s.drawSweptMesh(a,texture,l,p,view,{first:i===0,last:i===s.sweptLayers.length-1});r.globalAlpha=l.spec[5];r.drawImage(texture,p.x,p.y,p.w,p.h)}
  const aa=a.getImageData(0,0,414,714).data,bb=r.getImageData(0,0,414,714).data,rects=s.sweptLayers.map(l=>s.sweptRect(l,view));let max=0,sum=0,n=0;const points=[];
  for(let y=170;y<520;y++)for(let x=3;x<411;x++){if(rects.some(p=>(Math.abs(x-p.x)<3||Math.abs(x-p.x-p.w)<3)||(Math.abs(y-p.y)<3||Math.abs(y-p.y-p.h)<3)))continue;const k=(y*414+x)*4+3,d=Math.abs(aa[k]-bb[k]);max=Math.max(max,d);sum+=d;n++}
  for(const x of [.2,.5,.8]){const k=(Math.floor(714*.35)*414+Math.floor(414*x))*4+3;points.push(aa[k])}
  return {meanAlphaError:sum/n,maxAlphaError:max,upperLayerAlpha:points,webgl:!!s.meshRenderer};
 });
 assert.ok(metrics.webgl);assert.ok(metrics.meanAlphaError<2);assert.ok(metrics.maxAlphaError<8);assert.ok(metrics.upperLayerAlpha.some(a=>a>50));
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);await page.screenshot({path:fileURLToPath(new URL('./muhly-mobile-reference.png',import.meta.url))});
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(500);await page.screenshot({path:fileURLToPath(new URL('./muhly-mobile-animated.png',import.meta.url))});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({metrics,errors}));
}finally{await browser.close()}
