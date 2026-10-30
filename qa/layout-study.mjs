import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../dist/',import.meta.url)),qa=fileURLToPath(new URL('./',import.meta.url)),research=fileURLToPath(new URL('../research/',import.meta.url));
const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE_PATH?{executablePath:process.env.CHROME_EXECUTABLE_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 await page.route('http://study.local/**',async r=>{const u=new URL(r.request().url()),p=join(root,decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));try{await r.fulfill({body:await readFile(p),contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[extname(p)]||'application/octet-stream'})}catch{await r.fulfill({status:404,body:'Missing'})}});
 await page.goto('http://study.local/');await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#weather[data-next]').waitFor();for(let i=0;i<3&&await page.locator('main').getAttribute('data-scene')!=='day';i++)await page.locator('#weather').click();
 const species=[['maple','梧桐'],['ginkgo','银杏'],['cherry','樱花'],['willow','垂柳'],['jacaranda','蓝花楹'],['muhly','粉黛']],metrics=[];
 for(const [view,w,h] of [['mobile',390,844],['desktop',1200,900]]){
  await page.setViewportSize({width:w,height:h});const shots=[];
  for(const [kind,label] of species){await page.locator(`button[data-species="${kind}"]`).click();await page.waitForTimeout(90);const png=await page.screenshot();shots.push({label,data:png.toString('base64')});await writeFile(join(qa,`study-${view}-${kind}.png`),png);
   const alpha=await page.locator('canvas').evaluate(c=>{const ctx=c.getContext('2d'),{data,width,height}=ctx.getImageData(0,0,c.width,c.height);let count=0,total=0,minX=width,minY=height,maxX=0,maxY=0;for(let y=0;y<height;y+=3)for(let x=0;x<width;x+=3){total++;if(data[(y*width+x)*4+3]>=90){count++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}}return{coverage:Number((count/total).toFixed(3)),left:Number((minX/width).toFixed(3)),right:Number((maxX/width).toFixed(3)),top:Number((minY/height).toFixed(3)),bottom:Number((maxY/height).toFixed(3))}});metrics.push({view,kind,...alpha});
  }
  const sheet=await page.evaluate(async({shots,w,h})=>{const tw=w===390?260:480,th=h*tw/w,c=document.createElement('canvas');c.width=tw*3;c.height=(th+32)*2;const g=c.getContext('2d');g.fillStyle='#edf0eb';g.fillRect(0,0,c.width,c.height);for(let i=0;i<shots.length;i++){const im=new Image();im.src='data:image/png;base64,'+shots[i].data;await im.decode();const x=i%3*tw,y=Math.floor(i/3)*(th+32);g.fillStyle='#344c43';g.font='15px sans-serif';g.fillText(shots[i].label,x+12,y+23);g.drawImage(im,x,y+32,tw,th)}return c.toDataURL('image/png').split(',')[1]},{shots,w,h});await writeFile(join(research,`layout-comparison-${view}.png`),Buffer.from(sheet,'base64'));
 }
 await writeFile(join(research,'layout-audit.json'),JSON.stringify({note:'Same viewport, daylight, reduced motion. Coverage counts canvas pixels with alpha >= 90/255; includes muhly atmospheric fill, excludes HTML controls and CSS backdrop.',metrics},null,2));console.log(JSON.stringify(metrics));
}finally{await browser.close()}
