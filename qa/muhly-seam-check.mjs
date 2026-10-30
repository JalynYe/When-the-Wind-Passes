import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE_PATH});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 await page.route('http://seam.local/**',async route=>{const module=route.request().url().endsWith('muhly-field.js');await route.fulfill({body:module?await readFile(new URL('../dist/muhly-field.js',import.meta.url)):'<!doctype html><body></body>',contentType:module?'text/javascript':'text/html'})});
 await page.goto('http://seam.local/');
 const metrics=await page.evaluate(async()=>{
  const {MuhlyField}=await import('/muhly-field.js'),s=new MuhlyField({ambient:false});
  const texture=document.createElement('canvas');texture.width=512;texture.height=256;const g=texture.getContext('2d');g.fillStyle='rgba(180,100,130,.3)';g.fillRect(0,0,512,256);s.sweptImage=texture;
  const view=s.layout(390,844,615),layer=s.sweptLayers[2],rect=s.sweptRect(layer,view);
  // Nonzero simulation state selects the mesh path; zero head offsets isolate alpha seams.
  for(const n of layer.nodes){n.bend=.02;n.head=0}
  const make=()=>{const c=document.createElement('canvas');c.width=390;c.height=844;return c};
  const mesh=make(),reference=make();s.drawSwept(mesh.getContext('2d'),layer,view,'day');const r=reference.getContext('2d');r.globalAlpha=layer.spec[5];r.drawImage(texture,rect.x,rect.y,rect.w,rect.h);
  const a=mesh.getContext('2d').getImageData(0,0,390,844).data,b=r.getImageData(0,0,390,844).data;let count=0,sum=0,max=0;
  for(let y=Math.ceil(rect.y+3);y<Math.min(841,rect.y+rect.h-3);y++)for(let x=Math.max(3,Math.ceil(rect.x+3));x<Math.min(387,rect.x+rect.w-3);x++){const i=(y*390+x)*4+3,d=Math.abs(a[i]-b[i]);sum+=d;count++;max=Math.max(max,d)}
  return {pixels:count,meanAlphaError:sum/count,maxAlphaError:max};
 });
 console.log(JSON.stringify(metrics));assert.ok(metrics.meanAlphaError<1);assert.ok(metrics.maxAlphaError<8);
}finally{await browser.close()}
