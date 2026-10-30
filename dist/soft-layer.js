// Cached small layers use a separable premultiplied-alpha blur on every browser.
// Canvas2D.filter is deliberately avoided: some iOS versions silently ignore it.
export function softLayer(width,height,radius,paint){
 const ratio=Math.min(.34,160/Math.max(1,width)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(width*ratio));canvas.height=Math.max(1,Math.ceil(height*ratio));const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);paint(ctx);
 const w=canvas.width,h=canvas.height,pixels=ctx.getImageData(0,0,w,h),data=pixels.data;let a=new Float32Array(data.length),b=new Float32Array(data.length);
 for(let i=0;i<data.length;i+=4){const alpha=data[i+3]/255;a[i]=data[i]*alpha;a[i+1]=data[i+1]*alpha;a[i+2]=data[i+2]*alpha;a[i+3]=data[i+3]}
 const r=Math.max(1,Math.round(radius*ratio)),span=r*2+1;
 const pass=horizontal=>{const lines=horizontal?h:w,length=horizontal?w:h,stride=horizontal?4:w*4;
  for(let line=0;line<lines;line++){const base=horizontal?line*w*4:line*4;for(let c=0;c<4;c++){let sum=0;for(let k=-r;k<=r;k++)sum+=a[base+Math.max(0,Math.min(length-1,k))*stride+c];for(let p=0;p<length;p++){b[base+p*stride+c]=sum/span;sum+=a[base+Math.min(length-1,p+r+1)*stride+c]-a[base+Math.max(0,p-r)*stride+c]}}}
  const swap=a;a=b;b=swap;
 };
 for(let i=0;i<3;i++){pass(true);pass(false)}
 for(let i=0;i<data.length;i+=4){const alpha=a[i+3];data[i+3]=alpha;if(alpha>0){data[i]=a[i]*255/alpha;data[i+1]=a[i+1]*255/alpha;data[i+2]=a[i+2]*255/alpha}else data[i]=data[i+1]=data[i+2]=0}
 ctx.putImageData(pixels,0,0);return canvas;
}
