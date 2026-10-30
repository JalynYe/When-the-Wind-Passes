import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../dist/',import.meta.url)),out=fileURLToPath(new URL('./',import.meta.url));
const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE_PATH?{executablePath:process.env.CHROME_EXECUTABLE_PATH}:{})}),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://layout.local/**',async route=>{const u=new URL(route.request().url()),path=join(root,decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));try{await route.fulfill({body:await readFile(path),contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[extname(path)]||'application/octet-stream'})}catch{await route.fulfill({status:404,body:'Missing'})}});
 await page.goto('http://layout.local/');await page.locator('button[data-species="muhly"]').click();await page.locator('#weather[data-next]').waitFor();for(let i=0;i<3&&await page.locator('main').getAttribute('data-scene')!=='day';i++)await page.locator('#weather').click();
 const layouts=[];
 for(const [name,width,height] of [['desktop',1200,900],['mobile',390,844],['small',320,568],['landscape',667,375],['boundary',721,560]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(180);
  const result=await page.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}},picker=rect(document.querySelector('.species-picker')),nav=rect(document.querySelector('nav')),weather=rect(document.querySelector('#weather')),sound=rect(document.querySelector('#sound')),overlap=(a,b)=>a.x<b.right&&b.x<a.right&&a.y<b.bottom&&b.y<a.bottom,regions=[picker,nav,weather,sound],style=getComputedStyle(document.querySelector('.species-picker'));return {overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,fit:[...document.querySelectorAll('button')].every(b=>{const r=rect(b);return r.x>=0&&r.y>=0&&r.right<=innerWidth+.1&&r.bottom<=innerHeight+.1}),overlap:regions.some((a,i)=>regions.slice(i+1).some(b=>overlap(a,b))),anchored:sound.x<innerWidth*.2&&sound.y>innerHeight*.65&&weather.x>innerWidth*.7&&weather.y<innerHeight*.2&&nav.x>innerWidth*.6&&nav.y>innerHeight*.65,plain:style.backgroundColor==='rgba(0, 0, 0, 0)'&&(style.backdropFilter==='none'||!style.backdropFilter),picker,nav,weather,sound}});
  assert.equal(result.overflow,false,name);assert.equal(result.fit,true,name);assert.equal(result.overlap,false,name);assert.equal(result.anchored,true,name);assert.equal(result.plain,true,name);
  layouts.push({name,width,height,...result});await page.screenshot({path:join(out,`muhly-layout-${name}.png`)});
 }
 const sound=page.locator('#sound'),initial=await sound.getAttribute('aria-pressed');await sound.click();assert.notEqual(await sound.getAttribute('aria-pressed'),initial);await sound.click();assert.equal(await sound.getAttribute('aria-pressed'),initial);
 for(let i=0;i<3;i++){const next=await page.locator('#weather').getAttribute('data-next');await page.locator('#weather').click();assert.equal(await page.locator('main').getAttribute('data-scene'),next);if(next==='day')break}
 assert.equal(await page.locator('button[data-species="muhly"]').getAttribute('aria-pressed'),'true');
 await page.locator('button[data-species="ginkgo"]').click();assert.equal(await page.locator('button[data-species="ginkgo"]').getAttribute('aria-pressed'),'true');await page.locator('button[data-species="muhly"]').click();await page.locator('#breeze').click();await page.waitForTimeout(150);await page.locator('#reset').click();
 assert.deepEqual(errors,[]);console.log(JSON.stringify({viewports:layouts.map(({name,width,height,fit,overlap,anchored,plain})=>({name,width,height,fit,overlap,anchored,plain})),errors}));
}finally{await browser.close()}
