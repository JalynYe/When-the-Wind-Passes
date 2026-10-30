(async function(){
// Art-directed scaffold, deterministic smaller branches and leaf buds.
function randomSource(seed=3917){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function curvePoint(c,t){const u=1-t;return{x:u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y:u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]}}
function makeTree(kind='maple'){
 if(kind==='willow')return makeWillow();
 if(kind==='jacaranda')return makeJacaranda();
 const ginkgo=kind==='ginkgo',cherry=kind==='cherry',random=randomSource(ginkgo?9163:cherry?5237:3917),branches=[],origin={x:450,y:745};
 function add(parent,t,end,width,bend=0){const p=parent<0?origin:(()=>{const b=branches[parent],q=curvePoint(b.c,t);return{x:b.restOrigin.x+q.x,y:b.restOrigin.y+q.y}})();const dx=end[0]-p.x,dy=end[1]-p.y;branches.push({parent,t,c:[[0,0],[dx*.24+bend,dy*.36],[dx*.8+bend*.35,dy*.78],[dx,dy]],width,theta:0,omega:0,angle:0,origin:Object.assign({},p),restOrigin:p,depth:parent<0?0:branches[parent].depth+1});return branches.length-1}
 add(-1,0,ginkgo?[462,120]:cherry?[465,280]:[474,285],ginkgo?23:cherry?24:25,ginkgo?-15:-27);
 // Unequal forks and open spaces establish the silhouette before foliage.
 const specs=cherry?[
 [0,.38,[202,433],9,-28],[0,.45,[686,412],9,27],
 [0,.51,[180,337],8,-33],[0,.57,[710,314],8,28],
 [0,.66,[309,205],7,-18],[0,.72,[598,187],7,19],
 [0,.78,[419,139],5,-8],[0,.82,[520,130],5,11],
 [1,.65,[124,362],3,-10],[2,.66,[757,340],3,10],
 [3,.58,[146,258],3,-8],[4,.62,[744,246],3,9],
 [1,.54,[363,270],3,-11],[2,.54,[548,258],3,11],
 [0,.63,[388,231],4,-10],[0,.69,[538,222],4,10],
 [0,.57,[330,328],3,-9],[0,.62,[570,320],3,11],
 [0,.48,[428,405],2.5,-4]
 ]:ginkgo?[
 [0,.36,[245,415],7,-18],[0,.43,[650,382],8,20],
 [0,.48,[300,320],6,-10],[0,.53,[595,300],7,10],
 [0,.60,[275,230],5,-12],[0,.64,[627,205],6,15],
 [0,.72,[355,155],4,-10],[0,.78,[558,110],5,9],
 [0,.82,[425,88],3,-6],[0,.88,[480,48],3,5],
 [2,.64,[690,335],3,8],[1,.60,[190,350],3,-8],
 [0,.58,[373,151],5,-12],[0,.65,[538,139],5,12],
 [0,.76,[415,128],4,-7],[0,.83,[508,120],4,7]
 ,[0,.26,[310,486],6,-11],[0,.31,[589,474],6,13]
 ]:[
 [0,.40,[206,430],8,-31],[0,.48,[682,415],10,29],
 [0,.50,[236,330],10,-35],[0,.59,[627,280],8,25],
 [0,.68,[342,186],10,-30],[0,.80,[497,102],8,-16],
 [0,.55,[443,244],6,-25],[2,.62,[723,360],4,16],
 [3,.57,[188,270],4,-13],[4,.64,[680,216],3,17],
 [5,.65,[300,147],4,-12],[6,.66,[561,139],3,15],
 [0,.57,[315,280],3,-16],[0,.63,[568,263],3,15],[0,.43,[433,397],3,-5]
 ];
 const leaders=specs.map(args=>add(...args));const buds=[],bridgeBuds=[];
 for(const [k,id] of leaders.entries()){
  const main=branches[id],end=main.c[3],length=Math.hypot(...end),direction=Math.atan2(end[1],end[0]);
  const count=ginkgo?7+(k%2):cherry?8+(k%3):6+(k%3);
  for(let j=0;j<count;j++){
   const t=(ginkgo?.28:.18)+(j/(count-1))*(ginkgo?.7:.78)+(random()-.5)*.08,p=curvePoint(main.c,t),angle=direction+(j%2?1:-1)*(.32+random()*.8),len=(ginkgo?24:28)+random()*(ginkgo?49:58);
   const x=main.restOrigin.x+p.x+Math.cos(angle)*len,y=main.restOrigin.y+p.y+Math.sin(angle)*len;
   const twig=add(id,t,[x,y],1.3+random()*.8,(random()-.5)*18);buds.push(twig);if(cherry&&k>=leaders.length-4)bridgeBuds.push(twig);
  }
 }
 const leaves=[];
 const pickSprite=()=>!ginkgo&&!cherry?Math.floor(random()*5):[0,0,0,1,1,2][Math.floor(random()*6)];
 const pickTone=()=>{if(ginkgo||cherry)return Math.floor(random()*3);const n=random();return n<.12?0:n<.44?1:n<.72?2:n<.92?3:4};
 for(let i=0;i<(ginkgo?1125:cherry?1450:1490);i++){
  const branch=buds[i%buds.length],side=random()<.5?-1:1;
  leaves.push({id:i,branch,t:cherry?.18+Math.floor(random()*4)*.22+(random()-.5)*.085:.16+Math.pow(random(),.7)*.84,side,offset:5+random()*(ginkgo?24:31),rest:side*(.3+random()*1.5),size:ginkgo?18+random()*16:cherry?14+random()*8:16+random()*14,sprite:pickSprite(),layer:random()<.36?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Short petioles on the outer half of large limbs fill gaps between twig clusters.
 for(let i=0;i<225;i++){
  const id=leaves.length,branch=leaders[i%leaders.length],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.46+random()*.48,side,offset:12+random()*(ginkgo?31:42),rest:side*(.25+random()*1.3),size:ginkgo?17+random()*16:cherry?13+random()*8:15+random()*12,sprite:pickSprite(),layer:random()<.48?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Fill the inside of each crown as separate leaves, preserving natural gaps at its edge.
 for(let i=0;i<(ginkgo?650:cherry?470:600);i++){
  const id=leaves.length,branch=leaders[i%leaders.length],side=random()<.5?-1:1;
  leaves.push({id,branch,t:(ginkgo?.18:.24)+random()*(ginkgo?.7:.58),side,offset:7+random()*(ginkgo?34:24),rest:side*(.25+random()*1.3),size:ginkgo?17+random()*17:cherry?12+random()*8:14+random()*10,sprite:pickSprite(),layer:random()<(ginkgo?.46:.72)?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // A few clusters on inward-pointing twigs close the two large gaps beside the crown centre.
 if(cherry)for(let i=0;i<680;i++){
  const id=leaves.length,branch=bridgeBuds[i%bridgeBuds.length],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.22+Math.floor(random()*3)*.27+(random()-.5)*.07,side,offset:5+random()*24,rest:side*(.3+random()*1.4),size:13+random()*8,sprite:pickSprite(),layer:random()<.56?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Let small foreground clusters interrupt the exposed upper limbs without hiding the trunk.
 if(!ginkgo)for(let i=0;i<(cherry?350:330);i++){
  const id=leaves.length,branch=leaders[i%8],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.43+random()*.5,side,offset:3+random()*(cherry?20:23),rest:side*(.2+random()*1.25),size:cherry?14+random()*7:17+random()*10,sprite:pickSprite(),layer:random()<.18?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Smaller leaves and blossoms bridge the inner forks while the trunk stays legible.
 if(!ginkgo)for(let i=0;i<(cherry?430:330);i++){
  const id=leaves.length,branch=leaders[[0,1,2,3,4,5,6,7][i%8]],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.26+random()*.48,side,offset:6+random()*(cherry?36:42),rest:side*(.2+random()*1.25),size:cherry?14+random()*7:17+random()*10,sprite:pickSprite(),layer:random()<.16?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 if(!ginkgo&&!cherry){
  const gapBranches=leaders.slice(-3);
  for(let i=0;i<330;i++){
   const leaf=leaves[leaves.length-330+i];
   leaf.branch=gapBranches[i%gapBranches.length];leaf.t=.24+random()*.64;
   leaf.offset=8+random()*32;leaf.size=15+random()*10;
  }
 }
 if(cherry)for(const branch of buds)for(let j=0;j<2;j++){
  const id=leaves.length,side=j?1:-1;
  leaves.push({id,branch,t:.78+j*.17,side,offset:3+random()*13,rest:side*(.2+random()),size:12+random()*6,sprite:pickSprite(),layer:'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Shape the whole scaffold around its rooted base: a deeper, narrower crown
 // reads as a taller tree without pushing the canopy out of the mobile frame.
 for(const b of branches){
  const sx=ginkgo?.89:.88,sy=ginkgo?1.17:1.16;
  b.restOrigin={x:450+(b.restOrigin.x-450)*sx,y:745+(b.restOrigin.y-745)*sy};
  b.origin=Object.assign({},b.restOrigin);
  b.c=b.c.map(([x,y])=>[x*sx,y*sy]);
 }
 return{branches,leaves};
}

// Blue jacaranda: arching limbs remain visible beneath separate terminal flower clouds.
function makeJacaranda(){
 const random=randomSource(6729),branches=[],origin={x:450,y:745};
 function add(parent,t,end,width,bend=0){
  const p=parent<0?origin:(()=>{const b=branches[parent],q=curvePoint(b.c,t);return{x:b.restOrigin.x+q.x,y:b.restOrigin.y+q.y}})();
  const dx=end[0]-p.x,dy=end[1]-p.y;
  const depth=parent<0?0:branches[parent].depth+1,jitter=Math.sin(branches.length*2.71)*12;
  const c=depth===0?[[0,0],[dx*.24+bend,dy*.32],[dx*.79+bend*.4,dy*.75],[dx,dy]]:width>=3?[[0,0],[dx*.2+bend*1.8+jitter*1.2,dy*.08-(depth===1?48:24)],[dx*.83+bend*.65-jitter*.9,dy*.72-(depth===1?42:32)],[dx,dy]]:[[0,0],[dx*.13+bend*1.2,dy*.1-8],[dx*.91+bend*.4,dy*.72+6],[dx,dy]];
  branches.push({parent,t,c,width,theta:0,omega:0,angle:0,origin:Object.assign({},p),restOrigin:p,depth});
  return branches.length-1;
 }
 add(-1,0,[459,403],25,-13);
 const specs=[
  [0,.42,[195,395],10,-48],[0,.55,[699,441],9,28],
  [0,.69,[185,338],8,-39],[0,.76,[755,315],7,32],
  [3,.56,[234,230],8,-28],[4,.52,[676,220],8,27],
  [5,.63,[316,143],6,-18],[6,.67,[603,158],6,18],
  [7,.71,[380,103],5,-26],[8,.68,[543,119],5,27],
  [1,.56,[294,294],4,-16],[2,.58,[603,282],4,16],
  [0,.91,[441,306],5,18],[5,.68,[416,174],4,22],[6,.66,[491,150],4,-20],
  [0,.63,[365,344],3.5,-12],[0,.78,[530,323],3.5,14],
  [0,.89,[465,205],3,8],
  [1,.61,[335,365],3,13],[1,.43,[365,463],3.2,18]
 ];
 const leaders=specs.map(args=>add(...args)),twigs=[],centralTwigs=[],lowerTwigs=[],midTwigs=[],gapTwigs=[];
 for(const [k,id] of leaders.entries()){
  const main=branches[id],a=Math.atan2(main.c[3][1],main.c[3][0]);
  for(let j=0;j<7;j++){
   const t=.48+j*.075+(random()-.5)*.055,p=curvePoint(main.c,t),side=j%2?-1:1;
   const length=k===0?20+random()*47:28+random()*58,angle=a+side*(.35+random()*.73);
   const x=main.restOrigin.x+p.x+Math.cos(angle)*length;
   const y=main.restOrigin.y+p.y+Math.sin(angle)*length+random()*10;
   const twig=add(id,t,[x,y],1+random()*.8,(random()-.5)*22);twigs.push(twig);if(k>=12&&k<15)centralTwigs.push(twig);if(k>=15&&k<17)lowerTwigs.push(twig);if(k===17)midTwigs.push(twig);if(k>=18)gapTwigs.push(twig);
  }
 }
 const leaves=[];
 function bloom(branch,inside=false,lower=false){
  const id=leaves.length,side=random()<.5?-1:1;
  leaves.push({id,branch,t:lower?.32+random()*.46:inside?.76+random()*.22:.56+random()*.42,side,offset:lower?8+random()*18:inside?4+random()*13:5+random()*19,rest:side*(.2+random()*1.4),size:lower?25+random()*10:inside?27+random()*10:33+random()*15,sprite:0,layer:random()<(inside?.5:.32)?'back':'front',tone:(()=>{const n=random();return n<.58?0:n<.88?1:2})(),growth:1,state:'attached',stress:0,threshold:.17+random()*.15,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 for(let i=0;i<440;i++)bloom(twigs[i%twigs.length]);
 for(let i=0;i<110;i++)bloom(centralTwigs[i%centralTwigs.length]);
 for(let i=0;i<80;i++)bloom(lowerTwigs[i%lowerTwigs.length]);
 for(let i=0;i<70;i++)bloom(leaders[i%leaders.length],true);
 for(let i=0;i<110;i++)bloom(leaders[[1,2,3,4,15,16][i%6]],false,true);
 for(let i=0;i<190;i++){
  const leader=[0,0,1,2,3][i%5];
  bloom(leaders[leader],false,true);
 }
 for(let i=0;i<110;i++){
  bloom(leaders[i%2],false,true);
  const flower=leaves[leaves.length-1];flower.t=.12+random()*.43;flower.size=32+random()*11;flower.offset=5+random()*18;
 }
 for(let i=0;i<85;i++)bloom(midTwigs[i%midTwigs.length]);
 for(let i=0;i<145;i++)bloom(gapTwigs[i%gapTwigs.length]);
 // A loose veil along the inner right limb softens its empty wedge without hiding the bark.
 for(let i=0;i<54;i++){
  bloom(leaders[1],false,true);
  const flower=leaves[leaves.length-1];
  flower.t=.27+random()*.37;flower.size=24+random()*8;flower.offset=6+random()*12;
 }
 for(let i=0;i<46;i++){
  bloom(leaders[16],false,true);
  const flower=leaves[leaves.length-1];
  flower.t=.18+random()*.43;flower.size=23+random()*9;flower.offset=6+random()*13;
 }
 // Uneven overlapping flower pockets soften the diagonal without tracing its outline.
 const innerPockets=[
  {t:.055,spread:.035,side:1,offset:9,size:31,count:12},
  {t:.13,spread:.055,side:-1,offset:14,size:35,count:20},
  {t:.205,spread:.04,side:1,offset:5,size:28,count:11},
  {t:.275,spread:.065,side:1,offset:18,size:34,count:23},
  {t:.35,spread:.035,side:-1,offset:8,size:27,count:16}
 ];
 for(const pocket of innerPockets)for(let i=0;i<pocket.count;i++){
  bloom(leaders[3],false,true);
  const flower=leaves[leaves.length-1];
  flower.t=pocket.t+(random()-.5)*pocket.spread*2;
  flower.side=random()<.82?pocket.side:-pocket.side;
  flower.size=pocket.size*(.72+random()*.48);
  flower.offset=pocket.offset*(.35+random()*1.05);
  flower.layer='front';
 }
 // Fill the two exposed outer branch tips with small, airy flower clouds.
 for(let i=0;i<32;i++){bloom(twigs[[3,5][i%2]],true);const flower=leaves[leaves.length-1];flower.size*=.85;flower.edgeFill=true}
 // Bridge the right shoulder while keeping the lower edge tucked into the crown.
 const rightShoulder=add(leaders[3],.84,[724,402],1.35,6);
 for(let i=0;i<22;i++){bloom(rightShoulder,true);leaves[leaves.length-1].size*=.85}
 for(const flower of leaves)if(flower.branch===twigs[11]||flower.branch===twigs[13]){
  flower.t=Math.min(flower.t,.7);
  flower.size*=.86;
 }
 for(const b of branches){b.restOrigin={x:450+(b.restOrigin.x-450)*.9,y:745+(b.restOrigin.y-745)*1.13};b.origin=Object.assign({},b.restOrigin);b.c=b.c.map(([x,y])=>[x*.9,y*1.13])}
 // Thin the lower-left hanging cluster, preserving the branch and its soft outline.
 for(let i=leaves.length-1;i>=0;i--){
  const l=leaves[i],b=branches[l.branch],p=curvePoint(b.c,l.t);
  const x=b.restOrigin.x+p.x,y=b.restOrigin.y+p.y;
  const distance=Math.hypot((x-305)/165,(y-505)/125);
  if((!l.edgeFill&&x<215&&y>300&&y<470)||(distance<1&&((l.id*73)%101)/101<.58*(1-distance*.65)))leaves.splice(i,1);
 }
 const flowered=new Set(leaves.map(l=>l.branch));
 for(const twig of twigs.slice(0,7))if(!flowered.has(twig))branches[twig].hidden=true;
 // Prune the lone far-right sprig that breaks the crown's rounded outline.
 const farRightTip=twigs[27];
 for(let i=leaves.length-1;i>=0;i--)if(leaves[i].branch===farRightTip)leaves.splice(i,1);
 branches[farRightTip].hidden=true;
 // Add a little exposed trunk while keeping the crown's branch curves intact.
 const stem=branches[0];
 stem.c=stem.c.map(([x,y],i)=>[x,y-(i?26:0)]);
 for(const b of branches)if(b.parent>=0){const parent=branches[b.parent],p=curvePoint(parent.c,b.t);b.restOrigin={x:parent.restOrigin.x+p.x,y:parent.restOrigin.y+p.y};b.origin=Object.assign({},b.restOrigin)}
 leaves.forEach((l,i)=>l.id=i);
 return{branches,leaves};
}

// Willow uses its own scaffold: flexible hanging branchlets carry narrow leaves.
function makeWillow(){
 const random=randomSource(7403),branches=[],origin={x:450,y:745};
 function add(parent,t,end,width,bend=0){const p=parent<0?origin:(()=>{const b=branches[parent],q=curvePoint(b.c,t);return{x:b.restOrigin.x+q.x,y:b.restOrigin.y+q.y}})();const dx=end[0]-p.x,dy=end[1]-p.y;branches.push({parent,t,c:[[0,0],[dx*.24+bend,dy*.36],[dx*.8+bend*.35,dy*.78],[dx,dy]],width,theta:0,omega:0,angle:0,origin:Object.assign({},p),restOrigin:p,depth:parent<0?0:branches[parent].depth+1});return branches.length-1}
 add(-1,0,[454,150],27,-12);
 const specs=[
  [0,.43,[235,305],9,-34],[0,.48,[665,290],8,28],
  [0,.55,[218,210],8,-31],[0,.60,[682,215],8,30],
  [0,.66,[278,137],7,-23],[0,.68,[620,132],7,22],
  [0,.74,[344,103],6,-14],[0,.78,[405,76],6,-8],
  [0,.82,[467,68],6,4],[0,.78,[528,86],6,11],
  [0,.73,[575,112],5,17],[0,.58,[333,181],5,-14],
  [0,.64,[554,169],5,14],[0,.70,[451,119],4,2]
 ];
 const leaders=specs.map(([parent,t,end,width,bend])=>add(parent,t,[end[0]+(random()-.5)*24,end[1]+(random()-.5)*26],width,bend)),twigs=[],crownTwigs=[];
 for(const [k,id] of leaders.entries()){
  const main=branches[id];
  const dx=main.c[3][0],dy=main.c[3][1];
  main.c=[[0,0],[dx*(.21+random()*.2),dy*(.52+random()*.25)],[dx*(.67+random()*.2),dy-(20+random()*65)],[dx,dy]];
  main.width*=.7;
  const groups=3+Math.floor(random()*3);
  for(let group=0;group<groups;group++){
   const centre=.17+(group+.35+random()*.35)*.77/groups;
   const lean=(dx<0?-1:1)*(random()<.2?-1:1);
   const reach=130+random()*245;
   const strands=3+Math.floor(random()*4);
   for(let strand=0;strand<strands;strand++){
    const t=centre+(strand-(strands-1)/2)*(.011+random()*.013)+(random()-.5)*.016,q=curvePoint(main.c,t),x=main.restOrigin.x+q.x,y=main.restOrigin.y+q.y;
    const drift=lean*(13+random()*44)+(strand-(strands-1)/2)*(7+random()*6);
    const end=[x+drift,Math.min(695,y+reach+(random()-.5)*120)];
    const twig=add(id,t,end,.5+random()*.35),b=branches[twig],tx=b.c[3][0],ty=b.c[3][1];
    b.c=[[0,0],[lean*(15+random()*42),ty*(.04+random()*.14)],[tx+lean*(random()*28-8),ty*(.56+random()*.23)],[tx,ty]];twigs.push(twig);
   }
  }
  for(let j=0,n=6+Math.floor(random()*5);j<n;j++){
   const t=.36+(j+random()*.7)*.59/n,q=curvePoint(main.c,t),x=main.restOrigin.x+q.x,y=main.restOrigin.y+q.y;
   const drift=(j%2?1:-1)*(9+random()*25),end=[x+drift,y+38+random()*72];
   const twig=add(id,t,end,.42+random()*.25),b=branches[twig],dx=b.c[3][0],dy=b.c[3][1];
   b.c=[[0,0],[dx*(.35+random()*.4),dy*.12],[dx*(.2+random()*.45),dy*(.67+random()*.18)],[dx,dy]];crownTwigs.push(twig);
  }
 }
 const leaves=[];
 for(let i=0;i<3500;i++){
  const branch=twigs[i%twigs.length],side=i%2?-1:1;
  leaves.push({id:i,branch,t:.09+random()*.87,side,offset:2+random()*5,rest:side*(.17+random()*.45),size:4+random()*2.5,sprite:0,layer:random()<.44?'back':'front',tone:(()=>{const n=random();return n<.58?0:n<.88?1:2})(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 for(let i=0;i<1050;i++){
  const id=leaves.length,branch=crownTwigs[i%crownTwigs.length],side=i%2?-1:1;
  leaves.push({id,branch,t:.12+random()*.84,side,offset:2+random()*5,rest:side*(.17+random()*.45),size:4+random()*2.5,sprite:0,layer:random()<.48?'back':'front',tone:(()=>{const n=random();return n<.58?0:n<.88?1:2})(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Leaf-bearing shoots cross the large limbs, breaking up their continuous outlines.
 for(let i=0;i<520;i++){
  const id=leaves.length,branch=leaders[i%leaders.length],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.32+random()*.65,side,offset:3+random()*18,rest:side*(.12+random()*.7),size:4+random()*2.5,sprite:0,layer:'front',tone:(()=>{const n=random();return n<.58?0:n<.88?1:2})(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Keep the shared mobile camera while matching the other trees' world-space height.
 for(const b of branches){
  b.restOrigin={x:450+(b.restOrigin.x-450)*1.25,y:745+(b.restOrigin.y-745)*1.2};
  b.origin=Object.assign({},b.restOrigin);
  b.c=b.c.map(([x,y])=>[x*1.25,y*1.2]);
  if(b.depth>1)b.restCurve=b.c.map(p=>p.slice());
 }
 return{branches,leaves};
}

const STEP=1/120;
const TAU=Math.PI*2;
function bezier(c,t){const u=1-t;return {x:u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y:u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]};}
function tangent(c,t){const u=1-t;return Math.atan2(3*u*u*(c[1][1]-c[0][1])+6*u*t*(c[2][1]-c[1][1])+3*t*t*(c[3][1]-c[2][1]),3*u*u*(c[1][0]-c[0][0])+6*u*t*(c[2][0]-c[1][0])+3*t*t*(c[3][0]-c[2][0]));}
function rotate(p,a){return{x:p.x*Math.cos(a)-p.y*Math.sin(a),y:p.x*Math.sin(a)+p.y*Math.cos(a)}}
class Study{
 constructor(kind='maple'){this.kind=kind;this.reduced=false;this.reset()}
 reset(){this.time=0;this.wind=[];this.petals=[];this.tokens=3;this.gestureCount=0;this.brushDistance=0;this.brushCount=0;this.trails=[];this.regrowing=false;this.growthClock=0;this.ambientTick=0;const model=makeTree(this.kind);this.branches=model.branches;this.leaves=model.leaves;
 this.transform();for(const l of this.leaves){const p=this.anchor(l);Object.assign(l,p,{prev:Object.assign({},p)})}

 }
 transform(){for(const b of this.branches){if(b.parent<0){b.origin={x:450,y:745};b.angle=b.theta}else{const p=this.branches[b.parent],o=rotate(bezier(p.c,b.t),p.angle);b.origin={x:p.origin.x+o.x,y:p.origin.y+o.y};b.angle=p.angle+b.theta}}}
 point(b,t){const p=rotate(bezier(b.c,t),b.angle);return{x:p.x+b.origin.x,y:p.y+b.origin.y}}
 anchor(l){const b=this.branches[l.branch],p=this.point(b,l.t),a=b.angle+tangent(b.c,l.t),q=a+l.side*Math.PI/2;return{x:p.x+Math.cos(q)*l.offset,y:p.y+Math.sin(q)*l.offset,angle:this.kind==='willow'?l.rest*.8:a+l.rest}}
 emit(a,b,v){if(Math.hypot(v.x,v.y)<20)return;this.wind.push({a:Object.assign({},a),b:Object.assign({},b),v:Object.assign({},v),time:this.time});if(this.wind.length>16)this.wind.shift()}
 field(p){let x=0,y=0;for(const w of this.wind){const dx=w.b.x-w.a.x,dy=w.b.y-w.a.y,t=Math.max(0,Math.min(1,((p.x-w.a.x)*dx+(p.y-w.a.y)*dy)/(dx*dx+dy*dy||1))),r2=(p.x-w.a.x-t*dx)**2+(p.y-w.a.y-t*dy)**2,k=Math.max(0,1-r2/(140*140))**2*Math.exp(-(this.time-w.time)/.16)*STEP/.16*.95;x+=w.v.x*k;y+=w.v.y*k}const s=Math.min(1,750/(Math.hypot(x,y)||1));return{x:x*s,y:y*s}}
 beginGesture(){this.gestureCount=0;this.brushDistance=0;this.brushCount=0}
 // Direct contact also loosens a few leaves during short, sparsely sampled swipes.
 brush(a,b){const dx=b.x-a.x,dy=b.y-a.y,distance=Math.hypot(dx,dy);if(!distance)return;this.brushDistance=(this.brushDistance||0)+distance;if(this.brushDistance<35||(this.brushCount||0)>=6)return;
 const candidates=[];for(const l of this.leaves){if(l.state!=='attached'||l.fixed||l.age<=3)continue;const t=Math.max(0,Math.min(1,((l.x-a.x)*dx+(l.y-a.y)*dy)/(distance*distance))),d=Math.hypot(l.x-a.x-t*dx,l.y-a.y-t*dy);if(d<65)candidates.push({l,d})}candidates.sort((a,b)=>a.d-b.d||a.l.id-b.l.id);
 const count=Math.min(6-(this.brushCount||0),Math.floor(this.brushDistance/35),candidates.length);for(let i=0;i<count;i++){const l=candidates[i].l;l.state='loosening';l.releaseAge=0;l.releaseDelay=.2+(l.id%7)*.04}this.brushCount=(this.brushCount||0)+count;this.brushDistance%=35;
 }
 scatter(l){if(this.kind!=='cherry'||this.reduced)return;l.petal=l.id%47!==0;if(!l.petal)return;for(let i=0;i<3&&this.petals.length<210;i++){const sign=i%2?1:-1;this.petals.push({x:l.x+sign*(4+i*2),y:l.y-3*i,vx:l.vx+sign*(18+l.id%17+i*5),vy:l.vy-14-i*9,angle:l.angle+i*1.7,spin:sign*(1.1+l.id%5*.18),size:l.size*(.58+i*.035),age:0,groundAge:0,grounded:false,alpha:1,id:l.id*4+i})}}
 shedAmbient(){if(this.reduced||this.remaining<=this.leaves.length*.96)return false;this.ambientTick++;for(let i=0;i<this.leaves.length;i++){const l=this.leaves[(this.ambientTick*97+i)%this.leaves.length];if(l.state!=='attached'||l.fixed||l.age<3||l.y>430)continue;l.state='falling';l.age=0;l.vx=(l.id%2?1:-1)*(12+l.id%23);l.vy=-8;l.spin=(l.id%2?1:-1)*(this.kind==='ginkgo'?.7+l.id%5*.16:this.kind==='jacaranda'?.65+l.id%5*.14:this.kind==='willow'?.35+l.id%5*.09:.18+l.id%5*.08);l.detach={x:l.x,y:l.y,angle:l.angle};this.scatter(l);this.regrowing=true;return true}return false}
 setReduced(v){this.reduced=v;if(v){this.petals=[];for(const b of this.branches){b.theta=b.omega=0;if(b.restCurve){b.bend=b.bendVelocity=b.renderedBend=0;b.c=b.restCurve.map(p=>p.slice());b.renderOutline=null}}this.transform();for(const l of this.leaves)if(l.state==='falling'){l.state='fading';l.age=0}}}
 step(h=STEP){this.time+=h;this.tokens=Math.min(3,this.tokens+(this.kind==='willow'?4:12)*h);this.wind=this.wind.filter(w=>this.time-w.time<.45);
 for(const b of this.branches){if(this.reduced)continue;const p=this.point(b,.7),w=this.field(p),a=b.angle+tangent(b.c,.7),willow=this.kind==='willow',limit=willow&&b.depth>0?.16:.12,target=Math.max(-limit,Math.min(limit,(-Math.sin(a)*w.x+Math.cos(a)*w.y)*(b.parent<0?0:willow?.00029:.00022))),wn=TAU*(willow?.72:1.45);b.omega+=(wn*wn*(target-b.theta)-2*.84*wn*b.omega)*h;b.theta+=b.omega*h;if(b.restCurve){const aim=Math.max(-62,Math.min(62,w.x*.085)),freq=TAU*.48;b.bendVelocity=(b.bendVelocity||0)+(freq*freq*(aim-(b.bend||0))-2*.86*freq*(b.bendVelocity||0))*h;b.bend=(b.bend||0)+b.bendVelocity*h;b.c=b.restCurve.map(([x,y],i)=>[x+b.bend*[0,.16,.68,1][i],y]);if(Math.abs(b.bend-(b.renderedBend||0))>.25){b.renderOutline=null;b.renderedBend=b.bend}}}this.transform();
 const calm={x:0,y:0},branchWind=this.wind.length?this.branches.map(b=>[.125,.375,.625,.875].map(t=>this.field(this.point(b,t)))):null;
 let attached=this.remaining;const branchCounts=new Array(this.branches.length).fill(0);for(const l of this.leaves)if(l.state==='attached'||l.state==='loosening')branchCounts[l.branch]++;
 for(const l of this.leaves){l.age+=h;if(l.state==='growing'){const p=this.anchor(l);Object.assign(l,p);l.growth=Math.min(1,l.age/2.4);l.alpha=this.reduced?l.growth:1;if(l.growth===1){l.state='attached';l.stress=0;l.age=0}continue}if(l.state==='attached'||l.state==='loosening'){const p=this.anchor(l),av={x:(p.x-l.x)/h,y:(p.y-l.y)/h},w=branchWind?branchWind[l.branch][Math.min(3,(l.t*4)|0)]:calm;l.x=p.x;l.y=p.y;l.angle=p.angle;l.stress=Math.max(0,l.stress*Math.exp(-h/.38)+Math.max(0,Math.hypot(w.x-av.x,w.y-av.y)-75)/260*h);
 if(l.state==='attached'&&!l.fixed&&l.stress>l.threshold*(this.kind==='willow'?1.9:1)&&l.age>3){l.state='loosening';l.releaseAge=0;l.releaseDelay=.16+(l.id*37%13)*.03}
 if(l.state==='loosening'){l.releaseAge+=h;if(l.releaseAge>=l.releaseDelay&&this.tokens>=1&&attached>Math.ceil(this.leaves.length*.4)&&branchCounts[l.branch]>3&&(!this.reduced||this.gestureCount<3)){attached--;branchCounts[l.branch]--;this.tokens-=1;this.gestureCount++;l.state=this.reduced?'fading':'falling';l.age=0;l.vx=av.x+w.x*.3;l.vy=av.y+w.y*.3;l.spin=(l.id%2?1:-1)*(this.kind==='ginkgo'?.65+(l.id%5)*.18:this.kind==='jacaranda'?.55+(l.id%5)*.15:this.kind==='willow'?.35+(l.id%5)*.09:l.id%5===0?1.1:.22+(l.id%4)*.11);if(l.rainShed){l.vx+=(l.id%2?1:-1)*22;l.vy+=32;l.spin*=1.35;l.rainShed=false}l.detach={x:l.x,y:l.y,angle:l.angle};this.scatter(l)}else if(l.releaseAge>1.2){l.state='attached';l.stress=0}}
 }else if(l.state==='falling'){const w=this.field(l),drag=1.05+(l.id%4)*.13,gravity=(this.kind==='willow'?145:this.kind==='jacaranda'?104:120)+(l.id%5)*13,flutter=(this.kind==='ginkgo'?48:this.kind==='jacaranda'?37:this.kind==='willow'?12:25)+(l.id%7)*(this.kind==='willow'?3:8),phase=l.id*2.399;l.vx+=(drag*(w.x-l.vx)+flutter*Math.sin(this.time*(3.5+(l.id%5)*.35)+phase))*h;l.vy+=(gravity+drag*(w.y-l.vy))*h;l.x+=l.vx*h;l.y+=l.vy*h;const heightAboveGround=Math.max(0,751-l.y);l.angle+=(l.spin+.35*Math.sin(this.time*3+phase))*Math.min(1,heightAboveGround/95)*h;if(l.y+l.size*(this.kind==='jacaranda'?.324:l.petal?.38:.65)>=751){l.y=751-l.size*(this.kind==='jacaranda'?.324:l.petal?.38:.65);l.state='grounded';l.age=0;l.vx=l.vy=0}if(l.x<-100||l.x>1000||l.age>15){l.state='fading';l.age=0}}
 else if(l.state==='grounded'&&l.age>3.8+(l.id%4)*.55){l.state='fading';l.age=0}
 else if(l.state==='fading'){const t=Math.min(1,l.age/(this.reduced?.15:1.6));l.alpha=1-t*t*(3-2*t);if(t>=1){l.state='gone';l.age=0}}
 }
 for(const p of this.petals){p.age+=h;if(p.grounded){p.groundAge+=h;p.alpha=Math.max(0,Math.min(1,(4.1-p.groundAge)/1.4));continue}const w=this.field(p),phase=p.id*2.399;p.vx+=(1.4*(w.x-p.vx)+45*Math.sin(this.time*3.9+phase))*h;p.vy+=(88+1.4*(w.y-p.vy))*h;p.x+=p.vx*h;p.y+=p.vy*h;p.angle+=(p.spin+.4*Math.sin(this.time*2.8+phase))*h;if(p.y>=749){p.y=749;p.vx=p.vy=p.spin=0;p.grounded=true;p.groundAge=0}}this.petals=this.petals.filter(p=>p.alpha>0&&p.x>-100&&p.x<1000);
 const crown=this.leaves.filter(l=>['attached','loosening','growing'].includes(l.state)).length;
 if(crown<this.leaves.length*.95)this.regrowing=true;
 if(this.regrowing){this.growthClock+=h;if(this.growthClock>=.16){const ready=this.leaves.filter(l=>l.state==='gone'&&l.age>.6);ready.sort((a,b)=>branchCounts[a.branch]-branchCounts[b.branch]||a.id-b.id);const l=ready[0];if(l){Object.assign(l,this.anchor(l),{state:'growing',age:0,growth:0,alpha:this.reduced?0:1,stress:0,vx:0,vy:0,spin:0,petal:false});this.growthClock=0}}
 if(crown===this.leaves.length){this.regrowing=false;this.growthClock=0}}
 }
 get remaining(){return this.leaves.filter(l=>l.state==='attached'||l.state==='loosening').length}
 get active(){return this.regrowing||this.wind.length>0||this.petals.length>0||this.branches.some(b=>Math.abs(b.theta)>.00005||Math.abs(b.omega)>.0001||Math.abs(b.bend||0)>.01||Math.abs(b.bendVelocity||0)>.01)||this.leaves.some(l=>!['attached','gone'].includes(l.state))}
}

// Entirely synthesized PCM: no recordings, audio downloads, or embedded audio files.
// One second per beat (60 BPM); all pitched layers share C/E/G.
const MUSIC_BEAT=1;
function makeMusicBuffer(context,weather='day'){
 const rate=context.sampleRate,length=Math.round(rate*16),buffer=context.createBuffer(2,length,rate),left=buffer.getChannelData(0),right=buffer.getChannelData(1);
 const pattern=weather==='moon'?[[0,1],[3,.55],[6,.68]]:weather==='rain'?[[0,.86],[2.5,.57],[5,.7]]:[[0,1],[1.5,.56],[3,.72],[4,.88],[5.5,.5],[6.5,.62]];
 const voicings=[[[48,.021,-.12],[55,.016,.12]],[[55,.015,-.1],[60,.014,.12]],[[60,.013,-.12],[64,.010,.1]]];
 for(let phrase=0;phrase<2;phrase++)for(let note=0;note<pattern.length;note++){
  const [beat,accent]=pattern[note],start=phrase*8+beat*MUSIC_BEAT,duration=weather==='moon'?2.15:1.8;
  for(const [midi,level,pan] of voicings[(note+(phrase?1:0))%voicings.length]){
   const f=440*Math.pow(2,(midi-69)/12),l=Math.sqrt((1-pan)/2),r=Math.sqrt((1+pan)/2);
   for(let i=0;i<duration*rate;i++){const t=i/rate,attack=1-Math.exp(-t/.055),release=Math.pow(Math.max(0,1-t/duration),2),env=attack*release*Math.exp(-t*.8),phase=6.283185307*f*t,v=(Math.sin(phase)*.98+Math.sin(phase*2)*.02*Math.exp(-t*4))*env*level*accent*(phrase?.94:1),j=(Math.round(start*rate)+i)%length;left[j]+=v*l;right[j]+=v*r}
  }
 }
 return buffer;
}
function makeRainBuffer(context){
 const rate=context.sampleRate,length=Math.round(rate*18),buffer=context.createBuffer(2,length,rate);
 for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);let low=0,soft=0;for(let i=0;i<length;i++){const white=Math.random()*2-1;low=low*.98+white*.02;soft=soft*.48+white*.52;const t=i/rate,volume=.85+.1*Math.sin(t*Math.PI*2/18)+.05*Math.sin(t*Math.PI*4/18);data[i]=(soft-low)*.07*volume}
 // A dense fine patter beneath a few softer, larger leaf taps; both wrap at the loop seam.
 for(let k=0;k<1200;k++){const at=Math.floor(Math.random()*length),duration=.012+Math.random()*.035,frequency=650+Math.random()*1300,amplitude=.012+Math.random()*.024;let smooth=0;for(let i=0;i<duration*rate;i++){const t=i/rate;smooth=smooth*.4+(Math.random()*2-1)*.6;const env=(1-Math.exp(-t*1800))*Math.exp(-t*150);data[(at+i)%length]+=(smooth*.7+Math.sin(t*frequency*6.283)*.3)*env*amplitude}}
 for(let k=0;k<42;k++){const at=Math.floor(Math.random()*length),frequency=450+Math.random()*650;for(let i=0;i<rate*.13;i++){const t=i/rate,env=(1-Math.exp(-t*1300))*Math.exp(-t*52);data[(at+i)%length]+=Math.sin(6.283*frequency*(t-.7*t*t))*env*.024}}
 // Blend just the noise seam, rather than fading the entire loop to silence.
 const edge=Math.min(128,Math.floor(rate*.003));for(let i=0;i<edge;i++){const t=i/edge,a=t*t*(3-2*t);data[i]=data[length-1]*(1-a)+data[i]*a}
 }
 return buffer;
}
function makeBranchBuffer(context,midi){const rate=context.sampleRate,length=Math.round(rate*3.2),buffer=context.createBuffer(1,length,rate),d=buffer.getChannelData(0),f=440*Math.pow(2,(midi-69)/12);for(let i=0;i<length;i++){const t=i/rate,phase=6.2831853*f*t,env=(1-Math.exp(-t/.032))*Math.exp(-t*2.35)*Math.min(1,(3.2-t)*3),v=(Math.sin(phase)*.96+Math.sin(phase*2)*.035*Math.exp(-t*4)+Math.sin(phase*3)*.005*Math.exp(-t*6))*env*.11;d[i]+=v;for(const [delay,amount] of [[MUSIC_BEAT*.5,.065],[MUSIC_BEAT,.022]]){const j=i+Math.round(delay*rate);if(j<length)d[j]+=v*amount}}return buffer}
class WindAudio {
 constructor(){try{this.enabled=localStorage.getItem('tree-sound-off')!=='1'}catch(e){this.enabled=true}this.context=null;this.weather='day';this.hidden=false;this.noteBuffers=new Map();this.voices=[];this.nextNote=0;this.phraseIndex=0;this.lastNote=-Infinity}
 setup(context){this.context=context;this.musicGain=context.createGain();this.rainGain=context.createGain();this.musicGain.gain.value=0;this.rainGain.gain.value=0;
 this.duckGain=context.createGain();this.duckGain.gain.value=1;this.musicGain.connect(this.duckGain).connect(context.destination);
 this.musicLayers=['day','rain','moon'].map(weather=>{const source=context.createBufferSource(),gain=context.createGain();source.buffer=makeMusicBuffer(context,weather);source.loop=true;gain.gain.value=0;source.connect(gain).connect(this.musicGain);return {weather,source,gain}});this.musicSource=this.musicLayers[0].source;
 this.rainSource=context.createBufferSource();this.rainSource.buffer=makeRainBuffer(context);this.rainSource.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=4200;filter.Q.value=.45;this.rainSource.connect(filter).connect(this.rainGain).connect(context.destination);
 this.branchFilter=context.createBiquadFilter();this.branchFilter.type='lowpass';this.branchFilter.frequency.value=1100;this.branchFilter.Q.value=.4;this.branchFilter.connect(context.destination);const start=context.currentTime+.025;for(const layer of this.musicLayers)layer.source.start(start);this.rainSource.start(start);for(const midi of [48,60,64,67,72])this.noteBuffers.set(midi,makeBranchBuffer(context,midi));this.setWeather(this.weather)}
 setWeather(weather){this.weather=weather==='rain'?'rain':weather==='moon'?'moon':'day';if(!this.context)return;const now=this.context.currentTime;for(const layer of this.musicLayers){const p=layer.gain.gain;if(p.cancelAndHoldAtTime)p.cancelAndHoldAtTime(now);else{p.cancelScheduledValues(now);p.setValueAtTime(p.value,now)}p.setTargetAtTime(layer.weather===this.weather?1:0,now,.45)}for(const [parameter,target] of [[this.musicGain.gain,this.weather==='rain'?.3:this.weather==='moon'?.38:.85]]){if(parameter.cancelAndHoldAtTime)parameter.cancelAndHoldAtTime(now);else{parameter.cancelScheduledValues(now);parameter.setValueAtTime(parameter.value,now)}parameter.setTargetAtTime(target,now,.7)}const rain=this.rainGain.gain;if(rain.cancelAndHoldAtTime)rain.cancelAndHoldAtTime(now);else{rain.cancelScheduledValues(now);rain.setValueAtTime(rain.value,now)}rain.linearRampToValueAtTime(this.weather==='rain'?.75:0,now+.16)}

 activate(){if(!this.enabled||this.hidden)return;const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;if(!this.context)this.setup(new AudioContext());if(this.context.state==='suspended')this.context.resume().catch(()=>{})}
 playBranch(midi,strength=.5){if(!this.enabled||this.hidden||!this.context||this.context.state!=='running')return false;
 // First note responds immediately; following notes form a quiet, bounded strum.
 const allowed=[48,60,64,67,72];midi=allowed.reduce((best,n)=>Math.abs(n-midi)<Math.abs(best-midi)?n:best,allowed[0]);
 const c=this.context,now=c.currentTime;this.voices=this.voices.filter(v=>v.end>now);if(this.nextNote>now+.26||this.voices.some(v=>v.midi===midi&&now-v.at<.3))return false;
 if(now-this.lastNote>.35){this.nextNote=now+.008;this.phraseIndex=0}const at=Math.max(now+.008,this.nextNote),accent=Math.pow(.8,Math.min(2,this.phraseIndex++));this.lastNote=now;this.nextNote=at+MUSIC_BEAT/8;
 const fade=v=>{const p=v.gain.gain;if(p.cancelAndHoldAtTime)p.cancelAndHoldAtTime(now);else{p.cancelScheduledValues(now);p.setValueAtTime(p.value,now)}p.setTargetAtTime(.0001,now,.025);v.source.stop(now+.14)};
 const repeated=this.voices.find(v=>v.midi===midi);if(repeated){fade(repeated);this.voices=this.voices.filter(v=>v!==repeated)}if(this.voices.length>=4){fade(this.voices[0]);this.voices.shift()}
 if(!this.noteBuffers.has(midi))this.noteBuffers.set(midi,makeBranchBuffer(c,midi));const source=c.createBufferSource(),gain=c.createGain(),base=accent*(.4+Math.min(1,Math.max(0,strength))*.18)*(midi<60?.72:Math.pow(60/midi,1.25));gain.gain.value=base/Math.sqrt(1+this.voices.length*.5);for(const v of this.voices)v.gain.gain.setTargetAtTime(v.base/Math.sqrt(1+this.voices.length*.5),now,.06);
 source.buffer=this.noteBuffers.get(midi);source.connect(gain).connect(this.branchFilter);source.onended=()=>{source.disconnect();gain.disconnect()};source.start(at);this.voices.push({midi,at,base,gain,source,end:at+3.2});source.stop(at+3.2);
 const duck=this.duckGain.gain;if(duck.cancelAndHoldAtTime)duck.cancelAndHoldAtTime(now);else{duck.cancelScheduledValues(now);duck.setValueAtTime(duck.value,now)}duck.setTargetAtTime(.38,now,.06);duck.setTargetAtTime(1,at+1.1,.65);return true}

 stir(){}
 setEnabled(on){this.enabled=on;try{localStorage.setItem('tree-sound-off',on?'0':'1')}catch(e){}if(on)this.activate();else if(this.context)this.context.suspend().catch(()=>{});return this.enabled}
 visibility(hidden){this.hidden=hidden;if(!this.context)return;if(hidden||!this.enabled)this.context.suspend().catch(()=>{});else this.context.resume().catch(()=>{})}
}

const instrumentScale=[48,60,64,67,60,64,72,67,64,60];
function nearSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,n=dx*dx+dy*dy,t=n?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/n)):0;return {distance:Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t),t}}
class BranchInstrument {
 constructor(){this.bound=null;this.zones=[];this.cooldowns=new Map()}
 bind(sim){if(this.bound===sim)return;this.bound=sim;this.cooldowns.clear();this.zones=[];if(sim.kind==='muhly'||sim.isGrass||!sim.branches)return;if(sim.kind==='willow'){const leaders=sim.branches.filter(b=>b.parent===0);for(const b of sim.branches){if(b.hidden||b.depth!==2)continue;const parent=sim.branches[b.parent],group=leaders.indexOf(parent);if(group<0)continue;this.zones.push({branch:b,key:group,midi:instrumentScale[group%instrumentScale.length],radius:18})}return}const branches=sim.branches.filter(b=>b.parent===0&&b.width>=4).slice(0,10);branches.sort((a,b)=>b.width-a.width||a.restOrigin.y-b.restOrigin.y);for(let i=0;i<branches.length;i++)this.zones.push({branch:branches[i],key:i,midi:instrumentScale[Math.min(i,instrumentScale.length-1)]})}
 cross(sim,a,b,time){this.bind(sim);if(sim.kind==='muhly'||sim.isGrass)return this.crossGrass(sim,a,b,time);if(Math.hypot(b.x-a.x,b.y-a.y)<4)return [];const found=[];for(const z of this.zones){let contact=null;for(let i=2;i<=10;i++){const p=sim.point(z.branch,i/10),hit=nearSegment(p,a,b);if(hit.distance<(z.radius||36)&&Math.hypot(p.x-a.x,p.y-a.y)>(z.radius?20:39)&&(!contact||hit.t<contact.t))contact=hit}if(contact&&time-(this.cooldowns.has(z.key)?this.cooldowns.get(z.key):-Infinity)>.7)found.push({key:z.key,midi:z.midi,t:contact.t})}found.sort((a,b)=>a.t-b.t);const unique=[];for(const n of found)if(!unique.some(q=>q.key===n.key))unique.push(n);const notes=unique.slice(0,3);for(const n of notes)this.cooldowns.set(n.key,time);return notes}
 crossGrass(sim,a,b,time){
  if(!sim.viewport||!sim.tufts||![a.sx,a.sy,b.sx,b.sy].every(Number.isFinite)||Math.hypot(b.sx-a.sx,b.sy-a.sy)<4)return [];
  const from={x:a.sx,y:a.sy},to={x:b.sx,y:b.sy},view=sim.viewport,contacts=new Map(),pitches=[48,60,64,67,64,60];
  for(const tuft of sim.tufts){const p=sim.project(tuft,view),key=Math.max(0,Math.min(5,Math.floor(p.x/view.width*6)));if(time-(this.cooldowns.has(key)?this.cooldowns.get(key):-Infinity)<.7)continue;
   for(const u of [.35,.6,.85]){const point=sim.canopyPoint?sim.canopyPoint(tuft,p,u):{x:p.x+p.h*((tuft.rest+tuft.bend)*u*u+(tuft.head-tuft.bend)*u**5),y:p.root-p.h*u},hit=nearSegment(point,from,to),radius=Math.max(9,Math.min(18,p.h*.10));
    if(hit.distance>=radius)continue;const previous=contacts.get(key);if(!previous||hit.t<previous.t)contacts.set(key,{key,midi:pitches[key],t:hit.t});
   }
  }
  const notes=Array.from(contacts.values()).sort((a,b)=>a.t-b.t).slice(0,3);for(const note of notes)this.cooldowns.set(note.key,time);return notes;
 }

}

// Continuous grass canopy. Wind travels through ground space; roots stay fixed.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>t*t*(3-2*t);
function randomSource(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function hash(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)}
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),a=smooth(x-ix),b=smooth(y-iy);return (hash(ix,iy)*(1-a)+hash(ix+1,iy)*a)*(1-b)+(hash(ix,iy+1)*(1-a)+hash(ix+1,iy+1)*a)*b}

class MuhlyField{
 constructor({ambient=true}={}){this.kind='muhly';this.ambient=ambient;this.reduced=false;this.reset()}
 reset(){
  const random=randomSource(251025);this.time=0;this.backdrop=null;this.wind=[];this.seeds=[];this.branches=[];this.petals=[];this.seedBudget=0;
  this.sweptLayers=[[.30,.35,.94,.18,.95,.52],[.76,.405,.89,.30,.82,.63],[.23,.49,.66,.40,1.18,.71],[.68,.555,1.02,.64,.93,.81],[.43,.635,.62,.87,1.30,.91]].map(spec=>({spec,cols:13,rows:4,nodes:Array.from({length:52},(_,i)=>({col:i%13,row:Math.floor(i/13),bend:0,velocity:0,head:0,touch:0,touchUntil:0,stiffness:3.4+hash(i,spec[3])*1.0}))}));
  this.tufts=[];
  // Fixed, overlapping density pockets: coherent masses with open seams, not rows.
  const pockets=[[.27,.24,.22,.25],[.63,.39,.27,.24],[.43,.76,.29,.22]];
  while(this.tufts.length<360){
   const u=random(),z=random(),density=pockets.reduce((sum,[x,y,sx,sy])=>sum+Math.exp(-(((u-x)/sx)**2+((z-y)/sy)**2)*1.4),0);
   if(random()>Math.min(.94,.1+density*.76))continue;
   const local=noise(u*3.8+8,z*3.1+2),size=(92+z*245)*(.64+local*.54+random()*.25);
   this.tufts.push({id:this.tufts.length,x:u*900,z,
    rootY:280+z*745,state:'attached',size,width:.72+local*.38+random()*.22,
    rootOffset:random()*.035,rest:(local-.5)*.2+(random()-.5)*.13,
    bend:0,velocity:0,head:0,frequency:3.8+random()*1.8,
    damping:.66+random()*.16,phase:random()*Math.PI*2,sprite:random()<.5?0:1,
    tone:Math.floor(random()*4),alpha:.53+local*.25+random()*.15});
  }
  // Uneven banks vary at several scales; remove whole tufts, never clip the texture.
  this.tufts=this.tufts.filter(t=>{const u=t.x/900,z=t.z;
   const left=.025+.18*Math.exp(-(((z-.32)/.105)**2))+.12*Math.exp(-(((z-.69)/.085)**2))+.045*noise(z*17,2);
   const right=.97-.15*Math.exp(-(((z-.48)/.10)**2))-.09*Math.exp(-(((z-.86)/.07)**2))-.04*noise(z*19,6);
   return u>left&&u<right;
  });
  // Remove the foreground right lobe at the planting level, leaving scattered natural tips.
  this.tufts=this.tufts.filter(t=>!(t.z>.70+.10*noise(t.x*.013,4)&&this.ribbonX(t.x/900,t.z)>.23+.055*noise(t.z*11,7)));
  // A loose foreground fringe reconnects the lower-left hollow.
  const fringeSource=[...this.tufts];
  for(let i=0;i<22;i++){
   const u=.25+random()*.37,z=.955+random()*.045,source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push(Object.assign({},source,{id:360+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(.66+random()*.24),width:.66+random()*.24,
    rootOffset:random()*.035,alpha:.59+random()*.22,phase:random()*Math.PI*2}));
  }
  // Local extensions at the two screen crossings keep the banks loose.
  for(let i=0;i<34;i++){
   const upper=i<17,z=upper?.025+random()*.085:.975+random()*.025;
   const u=upper?.035+random()*.27:.37+random()*.12;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push(Object.assign({},source,{id:400+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(upper?1.18+random()*.43:.59+random()*.22),
    width:.63+random()*.23,rootOffset:upper?random()*.02:-.035-random()*.045,
    alpha:.54+random()*.24,phase:random()*Math.PI*2}));
  }
  // An off-centre pocket interrupts the long upper bank without forming a separate mound.
  for(let i=0;i<46;i++){
   const z=.40+random()*.20,u=.025+random()*.26;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push(Object.assign({},source,{id:450+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(1.30+.78*Math.exp(-(((z-.49)/.075)**2))+random()*.26),width:.68+random()*.29,
    rootOffset:random()*.025,alpha:.57+random()*.23,phase:random()*Math.PI*2}));
  }
  // Taller, interlocking tufts carry the upper bank into the left corner.
  for(let i=0;i<48;i++){
   const z=.62+random()*.19,u=.04+random()*.23;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push(Object.assign({},source,{id:500+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*([1.65,2.12,2.62][i%3]+random()*.25),width:.65+random()*.32,
    rootOffset:random()*.025,alpha:.55+random()*.24,phase:random()*Math.PI*2}));
  }
  // A tapering foreground pocket fills the lower-right while keeping an uneven bank.
  for(let i=0;i<33;i++){
   const z=.80+random()*.17,u=.66+random()*.18;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push(Object.assign({},source,{id:600+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(.68+random()*.30),width:.63+random()*.27,
    rootOffset:.025+random()*.065,alpha:.55+random()*.26,phase:random()*Math.PI*2}));
  }
  // Lower-right infill follows the raised meadow, with staggered root depths.
  for(let i=0;i<24;i++){
   const z=.92+random()*.075,u=.72+random()*.16;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push(Object.assign({},source,{id:650+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(1.18+random()*.48),width:.65+random()*.28,
    rootOffset:.005+random()*.055,alpha:.58+random()*.23,phase:random()*Math.PI*2}));
  }
  // Short foreground blooms bridge the hollow below the softened stems.
  for(let i=0;i<34;i++){
   const u=.43+random()*.43,z=.92+random()*.075;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push(Object.assign({},source,{id:700+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(.66+.31*noise(u*19,5)+random()*.22),width:.57+random()*.24,
    rootOffset:.01+.06*noise(u*13,8)+random()*.02,
    alpha:.60+random()*.23,phase:random()*Math.PI*2}));
  }
  // Extend the marked lower bank with long overlapping plumes, not separate short bunches.
  for(let i=0;i<28;i++){
   const u=.57+random()*.34,z=.955+random()*.04;
   const source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push(Object.assign({},source,{id:750+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(1.06+random()*.35),width:.62+random()*.24,
    rootOffset:-.015+random()*.04,fringeDrop:.09+random()*.055,lowerShift:.032,
    alpha:.57+random()*.23,phase:random()*Math.PI*2}));
  }
  // Fill the marked upper saddle with interlocking tall and medium plumes.
  for(let i=0;i<25;i++){
   const z=.20+random()*.15,u=.035+random()*.29,source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push(Object.assign({},source,{id:800+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(1.48+random()*.55),width:.66+random()*.27,
    rootOffset:random()*.025,alpha:.56+random()*.25,phase:random()*Math.PI*2}));
  }
  // Long foreground sprays overlap the lower-right edge rather than hang as short bunches.
  for(let i=0;i<20;i++){
   const z=.965+random()*.03,u=.73+random()*.17,source=fringeSource[Math.floor(random()*fringeSource.length)];
   this.tufts.push(Object.assign({},source,{id:850+i,x:u*900,z,rootY:280+z*745,
    size:(92+z*245)*(.99+random()*.35),width:.63+random()*.26,
    rootOffset:.045+random()*.035,fringeDrop:.07+random()*.025,lowerShift:.045,
    alpha:.57+random()*.23,phase:random()*Math.PI*2}));
  }
  this.tufts.sort((a,b)=>a.z-b.z);Object.assign(this.tufts[this.tufts.length-1],{z:1,rootOffset:0});for(const t of this.tufts)t.y=t.rootY-t.size*.65;this.leaves=this.tufts;
  const accents=[[-.46,.96],[-.30,.95],[-.12,.96],[.05,.91],[.21,.82],[.36,.69],[.47,.58],[.30,.30]];
  for(const [x,z] of accents){const tuft=this.tufts.filter(t=>!t.foliage).reduce((best,t)=>{const score=(this.ribbonX(t.x/900,t.z)-x)**2+(t.z-z)**2*2;return !best||score<best.score?{t,score}:best},null);if(tuft)tuft.t.foliage=true}
  this.tufts=this.tufts.filter(t=>t.foliage||t.z>.9||t.id%9!==4);this.leaves=this.tufts;
  const design=this.layout(390,844,615);
  for(const [x,y] of [[.24,.43],[.58,.35],[.76,.52],[.42,.60],[.64,.66]]){
   const nearest=this.tufts.filter(t=>!t.verdant).reduce((best,t)=>{const p=this.project(t,design),d=((p.x/390-x)*1.2)**2+( (p.root-p.h*.27)/844-y)**2;return !best||d<best.d?{t,d}:best},null);
   if(nearest)nearest.t.verdant=true;
  }
 }
 setReduced(value){this.reduced=value;if(value){this.wind=[];this.seeds=[];for(const t of this.tufts)t.bend=t.velocity=t.head=0;for(const layer of this.sweptLayers)for(const node of layer.nodes)node.bend=node.velocity=node.head=node.touch=0}}
 beginGesture(){this.seedBudget=4;this.gestureVX=this.gestureVY=0}
 brush(a,b){/* Muhly stays a rooted flower haze; brushing does not spawn floating particles. */}

 emit(a,b,v){
  if(this.reduced||b.inside===false||Math.hypot(v.x,v.y)<20)return;
  const last=this.wind[this.wind.length-1],strength=clamp(Math.hypot(v.x,v.y)/1450,.12,.85),direction=v.x<0?-1:1;
  if(last&&!last.broad&&this.time-last.born<.1&&Math.abs(last.x-b.x)<150){last.strength=Math.max(last.strength,strength);return}
  this.wind.push({x:b.x,z:clamp((b.y-185)/500,0,1),speed:direction*(185+strength*110),width:95+strength*70,strength:direction*strength,born:this.time,life:3.4,broad:false});
  if(this.wind.length>12)this.wind.shift();
 }
 breeze(){if(!this.reduced)this.wind.push({x:-300,z:.5,speed:245,width:180,strength:1.05,born:this.time,life:6.8,broad:true});if(this.wind.length>12)this.wind.shift()}
 sampleWind(x,z){
  const t=this.time;
  const drift=noise(x*.0034-t*.48,z*2.4);
  let value=this.ambient?.1+.42*smooth(clamp((drift-.28)/.55,0,1))+.06*noise(x*.008-t*.17,z*4.1):0;
  for(const g of this.wind){const age=t-g.born,center=g.x+g.speed*age+z*(g.broad?115:45),distance=(x-center)/g.width,across=g.broad?1:Math.exp(-(((z-g.z)/.22)**2)),fade=1-smooth(clamp((age-g.life+.8)/.8,0,1));value+=g.strength*Math.exp(-distance*distance*2)*across*fade}
  return clamp(value,-1.3,1.5);
 }
 step(h=1/60){
  this.time+=h;this.wind=this.wind.filter(g=>this.time-g.born<g.life);if(this.reduced)return;
  if(!this.sweptImage)for(const t of this.tufts){
   const local=this.sampleWind(t.x,t.z),detail=this.ambient?.012*Math.sin(this.time*2.6+t.phase):0,target=local*.27+detail;
   const w=t.frequency;t.velocity+=(w*w*(target-t.bend)-2*t.damping*w*t.velocity)*h;t.bend=clamp(t.bend+t.velocity*h,-.5,.55);
   t.head+=(t.bend-t.head)*(1-Math.exp(-h*6));
  }
  for(const layer of this.sweptLayers){
   const rect=this.viewport?this.sweptRect(layer,this.viewport):null;
   for(const node of layer.nodes){
    if(node.row===layer.rows-1){node.bend=node.velocity=node.head=node.touch=0;continue}
    const u=node.col/(layer.cols-1),v=node.row/(layer.rows-1),x=rect?(rect.x+rect.w*u)/this.viewport.width*900:u*900;
    const local=this.sampleWind(x,clamp(layer.spec[3]+(v-.5)*.14,0,1));
    const breeze=this.ambient?.045*Math.sin(this.time*.85-x*.007+layer.spec[3]*3)+.018*(noise(x*.011-this.time*.35,layer.spec[3]*4)-.5):0;
    node.touch*=Math.exp(-h*(this.time<node.touchUntil?0:12));
    const target=(local*.30+breeze)*(1-v)**1.55+node.touch,w=node.stiffness+4*smooth(clamp(Math.abs(node.touch)/.25,0,1));
    node.velocity+=(w*w*(target-node.bend)-1.35*w*node.velocity)*h;
    node.bend=clamp(node.bend+node.velocity*h,-.80,.80);
    node.head+=(node.bend-node.head)*(1-Math.exp(-h*12));
   }
  }
  for(const p of this.seeds){p.age+=h;p.x+=p.vx*h;p.y+=p.vy*h;p.vy+=12*h;p.vx+=Math.sin(this.time*2+p.phase)*h*5}
  this.seeds=this.seeds.filter(p=>p.age<4);
 }
 shedAmbient(){return false}
 get remaining(){return this.tufts.length}
 get active(){return !this.reduced}
 layout(width,height,groundY){
  const portrait=width<=600&&height>width;
  return {width,height,centerX:width/2,groundY:((groundY==null?height*(portrait?.73:.83):groundY))-height*.035,patchWidth:(portrait?width:Math.min(width*.92,height*1.5))*.96,patchHeight:height*.525};
 }
 ribbonX(u,z){
  const span=(.43+.13*z)*(1+.16*Math.sin(z*13+.6)+.09*Math.sin(z*25)),drift=.72-1.48*z+.065*Math.sin(z*5.4+.4)+.035*Math.sin(z*17+.7);
  const spread=1.08*smooth(clamp((z-.23)/.68,0,1));
  return (u-.5)*span+drift+spread*u**1.12;
 }
 project(t,view){
  const wave=Math.sin(t.z*17+t.x*.004+noise(t.x*.003,3)*1.5);
  const lateral=this.ribbonX(t.x/900,t.z);
  const upperNotch=1-.24*Math.exp(-(((lateral-.14)/.17)**2));
  const variation=t.size/(92+t.z*245)*(.94+.13*wave)*upperNotch;
  const edge=.91+.12*noise(t.x*.004+3,t.z*3);
  const baseRoot=Math.min(view.groundY+view.height*.06,view.groundY-view.patchHeight*(.95*(1-t.z)-.07+(t.rootOffset||0)));
  const room=Math.max(0,view.height-(view.width<=600?170:125)-baseRoot);
  const rightRise=view.patchHeight*.13*smooth(clamp((lateral+.02)/.48,0,1))*smooth(clamp((t.z-.72)/.25,0,1));
  const root=baseRoot+(room>0?room*(1-Math.exp(-view.patchHeight*(t.fringeDrop||0)/room)):0)+view.height*(t.lowerShift||0)-rightRise;
  return {x:view.centerX+this.ribbonX(t.x/900,t.z)*view.patchWidth,root,h:view.patchHeight*(.17+.22*t.z)*variation*edge,w:view.patchWidth*(.15+.15*t.z)*t.width};
 }
 touchProject(t,view){const p=this.project(t,view);if(this.sweptImage){p.h=Math.min(p.h,view.height*(.10+.065*t.z));p.w*=1.15}return p}
 fromScreen(x,y,width,height,groundY){
  const view=this.layout(width,height,groundY);this.viewport=view;
  if(this.sweptImage){const layer=this.frontLayer(x,y,view);return {x:x/width*900,y:185+((layer?layer.spec[3]:.5))*500,sx:x,sy:y,inside:!!layer}}
  let closest=null,score=Infinity;
  for(const t of this.tufts){const p=this.touchProject(t,view),dx=(x-p.x)/Math.max(12,p.w*.45),dy=(y-(p.root-p.h*.55))/Math.max(15,p.h*.57),d=dx*dx+dy*dy;if(d<score){score=d;closest=t}}
  return {x:closest.x,y:185+closest.z*500,sx:x,sy:y,inside:score<1.5||this.sweptHit(x,y,view)};
 }
 drag(a,b,velocity){
  if(this.reduced||!this.viewport||b.inside===false)return;
  const view=this.viewport,ax=(a.sx==null?b.sx:a.sx),ay=(a.sy==null?b.sy:a.sy),dx=b.sx-ax,dy=b.sy-ay,length2=dx*dx+dy*dy;
  if(!Number.isFinite(length2)||length2<.2)return;
  const dt=Number.isFinite(a.t)&&Number.isFinite(b.t)?clamp((b.t-a.t)/1000,.008,.08):1/30;
  const vx=Number.isFinite(a.t)&&Number.isFinite(b.t)?dx/dt:((velocity&&velocity.x!=null?velocity.x:dx*30)),vy=Number.isFinite(a.t)&&Number.isFinite(b.t)?dy/dt:((velocity&&velocity.y!=null?velocity.y:dy*30));
  const blend=1-Math.exp(-dt/.025);this.gestureVX=(this.gestureVX||0)+(vx-(this.gestureVX||0))*blend;this.gestureVY=(this.gestureVY||0)+(vy-(this.gestureVY||0))*blend;
  const drive=Math.tanh((this.gestureVX+this.gestureVY*.18)/380)*.80;
  const front=this.frontLayer(b.sx,b.sy,view);
  if(this.sweptImage)for(const layer of this.sweptLayers){
   if(layer!==front)continue;
   const p=this.sweptRect(layer,view);
   for(const node of layer.nodes){
    if(node.row===layer.rows-1)continue;
    const x=p.x+p.w*node.col/(layer.cols-1),y=p.y+p.h*node.row/(layer.rows-1);
    const along=clamp(((x-ax)*dx+(y-ay)*dy)/length2,0,1);
    const distance=Math.hypot(x-ax-dx*along,y-ay-dy*along),radius=38;
    const weight=smooth(clamp(1-distance/radius,0,1));
    if(weight){node.touch=drive*weight;node.touchUntil=this.time+.18}
   }
  }
  if(this.sweptImage)return;
  for(const t of this.tufts){const p=this.touchProject(t,view),px=p.x+(t.rest+t.head)*p.h*.6,py=p.root-p.h*.60;
   const along=length2?clamp(((px-ax)*dx+(py-ay)*dy)/length2,0,1):0;
   const distance=Math.hypot(px-ax-dx*along,py-ay-dy*along),radius=Math.max(20,Math.min(34,p.h*.30));
   if(distance>radius)continue;const weight=(1-distance/radius)**2;
   t.bend=clamp(t.bend+drive*.25*weight,-.5,.55);t.velocity=clamp(t.velocity+drive*2*weight,-1.5,1.5);
  }
 }

 canopyWeight(t){return (.80+.20*noise(t.x*.009+4,t.z*5))*(.82+.18*t.z)}
 textureForScene(image,t,p,view,scene){
  if(scene!=='moon')return image;
  if(!this.moonTextures)this.moonTextures=new WeakMap();let tones=this.moonTextures.get(image);if(!tones){tones=[];this.moonTextures.set(image,tones)}
  const exposure=clamp(.58*(1-p.x/view.width)+.42*(1-t.z),0,1),level=Math.min(2,Math.floor(exposure*3));if(tones[level])return tones[level];
  const c=document.createElement('canvas'),ratio=Math.min(1,256/Math.max(image.width,image.height));c.width=Math.max(1,Math.round(image.width*ratio));c.height=Math.max(1,Math.round(image.height*ratio));const g=c.getContext('2d');g.filter=`brightness(${.76+level*.10})`;g.drawImage(image,0,0,c.width,c.height);tones[level]=c;return c;
 }

 sweptRect(layer,view){
  const [cx,cy,span,,tall]=layer.spec,w=view.width*span,h=w*(this.sweptImage?this.sweptImage.height/this.sweptImage.width:.4)*tall;
  return {x:cx*view.width-w/2,y:cy*view.height-h/2,w,h};
 }
 frontLayer(x,y,view){
  if(!this.sweptImage)return null;
  for(let i=this.sweptLayers.length-1;i>=0;i--){const layer=this.sweptLayers[i],p=this.sweptRect(layer,view),u=(x-p.x)/p.w,v=(y-p.y)/p.h;
   if(u<.02||u>.98||v<.05||v>.88)continue;
   if(this.sweptImage.hitAlpha){const mask=this.sweptImage.hitAlpha,col=Math.min(mask.width-1,Math.floor(u*mask.width)),row=Math.min(mask.height-1,Math.floor(v*mask.height));if(mask.data[row*mask.width+col]<22)continue}
   return layer;
  }return null;
 }
 sweptHit(x,y,view){return !!this.frontLayer(x,y,view)}
 dispose(){const gl=(this.meshRenderer&&this.meshRenderer.gl);if(gl)(function(){const extension=gl.getExtension('WEBGL_lose_context');if(extension)extension.loseContext()})();this.meshRenderer=null}
 // Rasterize shared mesh edges once, avoiding Canvas clip seams on translucent grass.
 drawSweptMesh(target,image,layer,p,view,pass={first:true,last:true}){
  if(this.meshUnavailable)return false;
  if(!this.meshRenderer){
   const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,preserveDrawingBuffer:true});
   if(!gl){this.meshUnavailable=true;return false}
   const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
   try{
    const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 position;attribute vec2 uv;uniform vec2 viewport;varying vec2 texcoord;void main(){texcoord=uv;gl_Position=vec4(position.x/viewport.x*2.0-1.0,1.0-position.y/viewport.y*2.0,0.0,1.0);}'));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 texcoord;uniform sampler2D image;uniform float opacity;void main(){gl_FragColor=texture2D(image,texcoord)*opacity;}'));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    this.meshRenderer={canvas,gl,program,buffer:gl.createBuffer(),position:gl.getAttribLocation(program,'position'),uv:gl.getAttribLocation(program,'uv'),viewport:gl.getUniformLocation(program,'viewport'),opacity:gl.getUniformLocation(program,'opacity'),textures:new WeakMap()};
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.meshUnavailable=true});
   }catch(e){this.meshUnavailable=true;return false}
  }
  const r=this.meshRenderer,{gl,canvas}=r,ratio=Math.min(1.5,globalThis.devicePixelRatio||1),cw=Math.ceil(view.width*ratio),ch=Math.ceil(view.height*ratio);
  if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}
  gl.viewport(0,0,cw,ch);if(pass.first){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)}gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(r.program);gl.uniform1f(r.opacity,layer.spec[5]);
  let texture=r.textures.get(image);if(!texture){texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);r.textures.set(image,texture)}else gl.bindTexture(gl.TEXTURE_2D,texture);
  const vertices=[];
  const vertex=(col,row)=>{const node=layer.nodes[row*layer.cols+col],u=col/(layer.cols-1),v=row/(layer.rows-1),bend=node.head;vertices.push(p.x+p.w*u+bend*Math.min(p.h*.55,p.w/(layer.cols-1)*1.75),p.y+p.h*v+Math.abs(bend)*p.h*.09,u,v)};
  for(let row=0;row<layer.rows-1;row++)for(let col=0;col<layer.cols-1;col++){vertex(col,row);vertex(col+1,row);vertex(col,row+1);vertex(col+1,row);vertex(col+1,row+1);vertex(col,row+1)}
  gl.bindBuffer(gl.ARRAY_BUFFER,r.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(r.position);gl.vertexAttribPointer(r.position,2,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(r.uv);gl.vertexAttribPointer(r.uv,2,gl.FLOAT,false,16,8);gl.uniform2f(r.viewport,view.width,view.height);gl.drawArrays(gl.TRIANGLES,0,vertices.length/4);if(pass.last)gl.flush();
  if(pass.last){target.save();target.globalAlpha=1;target.drawImage(canvas,0,0,view.width,view.height);target.restore()}return true;
 }
 drawSwept(ctx,layer,view,scene){
  const p=this.sweptRect(layer,view),nodes=layer.nodes,image=this.textureForScene(this.sweptImage,{z:layer.spec[3]},{x:p.x+p.w/2},view,scene);
  ctx.save();ctx.globalAlpha=layer.spec[5];
  if(this.reduced||nodes.every(n=>Math.abs(n.bend)<.003)){ctx.drawImage(image,p.x,p.y,p.w,p.h);ctx.restore();return}
  const target=ctx;target.restore();
  if(this.drawSweptMesh(target,image,layer,p,view))return;
  if(!this.warpCanvas)this.warpCanvas=document.createElement('canvas');
  const ratio=Math.min(2,globalThis.devicePixelRatio||1),cw=Math.ceil(view.width*ratio),ch=Math.ceil(view.height*ratio);
  if(this.warpCanvas.width!==cw||this.warpCanvas.height!==ch){this.warpCanvas.width=cw;this.warpCanvas.height=ch}
  ctx=this.warpCanvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cw,ch);ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='lighter';
  // Shared antialiased edges add their complementary coverage once on the isolated layer.
  for(let row=0;row<layer.rows-1;row++)for(let col=0;col<layer.cols-1;col++){
   const sw=image.width/(layer.cols-1),sh=image.height/(layer.rows-1),sx=col*sw,sy=row*sh;
   const point=(c,r)=>{const n=nodes[r*layer.cols+c],bend=this.reduced?0:n.head;
    return [p.x+p.w*c/(layer.cols-1)+bend*Math.min(p.h*.55,p.w/(layer.cols-1)*1.75),p.y+p.h*r/(layer.rows-1)+Math.abs(bend)*p.h*.09];
   };
   const p00=point(col,row),p10=point(col+1,row),p01=point(col,row+1),p11=point(col+1,row+1);
   const triangles=[[[0,0],[sw,0],[0,sh],[p00,p10,p01]],[[sw,0],[sw,sh],[0,sh],[p10,p11,p01]]];
   for(const [s0,s1,s2,d] of triangles){
    const det=(s1[0]-s0[0])*(s2[1]-s0[1])-(s2[0]-s0[0])*(s1[1]-s0[1]);
    const aa=((d[1][0]-d[0][0])*(s2[1]-s0[1])-(d[2][0]-d[0][0])*(s1[1]-s0[1]))/det;
    const bb=((d[1][1]-d[0][1])*(s2[1]-s0[1])-(d[2][1]-d[0][1])*(s1[1]-s0[1]))/det;
    const cc=((s1[0]-s0[0])*(d[2][0]-d[0][0])-(s2[0]-s0[0])*(d[1][0]-d[0][0]))/det;
    const dd=((s1[0]-s0[0])*(d[2][1]-d[0][1])-(s2[0]-s0[0])*(d[1][1]-d[0][1]))/det;
    ctx.save();ctx.beginPath();ctx.moveTo(...d[0]);ctx.lineTo(...d[1]);ctx.lineTo(...d[2]);ctx.closePath();ctx.clip();
    ctx.transform(aa,bb,cc,dd,d[0][0]-aa*s0[0]-cc*s0[1],d[0][1]-bb*s0[0]-dd*s0[1]);
    ctx.drawImage(image,-sx,-sy);ctx.restore();
   }
  }ctx.restore();
  target.save();target.globalAlpha=layer.spec[5];target.drawImage(this.warpCanvas,0,0,cw,ch,0,0,view.width,view.height);target.restore();
 }
 drawFoliage(ctx,t,x,root,h,front){
  ctx.save();ctx.lineCap='round';
  const colors=['#879580','#9b9e7c','#b0a68c','#82958b'];
  for(let i=0;i<(front?7:12);i++){
   const r=hash(t.id*3+i,front?9:4),side=hash(i+17,t.id)*2-1;
   const reach=h*(front?.24:.30)*( .65+r*.85),base=x+side*h*.085;
   const sway=(this.reduced?0:t.bend)*reach*.85;
   const tipX=base+side*reach*(.35+hash(t.id,i)*.65)+sway;
   const tipY=root-reach*(.65+hash(i,t.id+2)*.35);
   ctx.strokeStyle=colors[(i+t.tone)%colors.length];ctx.globalAlpha=(front?.24:.18)*this.canopyWeight(t);
   ctx.lineWidth=(front?.85:.65)*( .7+r*.5);
   ctx.beginPath();ctx.moveTo(base,root-h*(.055+hash(t.id,i+21)*.045));
   ctx.bezierCurveTo(base+side*reach*.12,root-reach*.48,tipX-side*reach*.18,tipY-reach*.16,tipX,tipY);ctx.stroke();
  }
  ctx.restore();
 }
 drawGreenPocket(ctx,t,p){
  const image=this.greenPocket;if(!image)return;
  const height=Math.min(54,p.h*.26),width=height*1.5,base=p.root-p.h*.12;
  ctx.save();ctx.globalAlpha=.34;
  for(let i=0;i<5;i++){
   const v=i/5,u=1-v,sway=(this.reduced?0:t.bend)*height*u*u;
   ctx.drawImage(image,0,image.height*v,image.width,image.height/5,p.x-width/2+sway,base-height+height*v,width,height/5+.25);
  }
  ctx.restore();
 }

 drawBackdrop(ctx,view,textures,scene){
  const {width,height}=view;
  // Ground shading follows the ribbon instead of forming a floating oval.
  for(let i=0;i<20;i++){
   const z=i/19,p=this.project({x:450,z,size:92+z*245,width:1},view);
   ctx.save();ctx.translate(p.x,p.root+3);ctx.scale(1,.18);
   const radius=view.patchWidth*(.09+.06*z),shadow=ctx.createRadialGradient(0,0,0,0,0,radius);
   shadow.addColorStop(0,'rgba(85,98,74,.026)');shadow.addColorStop(1,'rgba(85,98,74,0)');ctx.fillStyle=shadow;ctx.fillRect(-radius,-radius,radius*2,radius*2);ctx.restore();
  }
  for(const t of this.tufts){
   const p=this.project(t,view);if(textures.swept){p.h=Math.min(p.h,height*(.10+.065*t.z));p.w*=1.15}const {x,root,h,w}=p,source=textures[t.sprite*4+t.tone]||textures[t.tone];if(!source)continue;const image=this.textureForScene(source,t,p,view,scene);
   const bend=t.rest+(textures.swept?0:t.bend),tip=t.rest+(textures.swept?0:t.head),drop=Math.min(.15,bend*bend*.28),drawH=h*(1-drop),top=root-drawH;
   if(t.verdant)this.drawGreenPocket(ctx,t,{x,root,h,w});
   if(t.foliage)this.drawFoliage(ctx,t,x,root,h,false);
   ctx.globalAlpha=t.alpha*this.canopyWeight(t)*(.84+.16*smooth(t.z))*(.96+.04*Math.cos(bend*3));
   if(textures.swept)ctx.globalAlpha*=.42;
   // Piecewise affine bending: strip boundaries meet, and the base stays pinned.
   const slices=t.z<.25?4:6,sourceH=image.height/slices;
   for(let i=0;i<slices;i++){
    const v0=i/slices,v1=(i+1)/slices,u0=1-v0,u1=1-v1;
    const offset=u=>h*(bend*u*u+(tip-bend)*u**5);
    const d0=offset(u0),d1=offset(u1),sliceH=drawH/slices;
    ctx.save();ctx.transform(1,0,(d1-d0)/sliceH,1,x-w*.5+d0,top+v0*drawH);
    ctx.drawImage(image,0,i*sourceH,image.width,sourceH,0,0,w,sliceH+.35);ctx.restore();
   }
   ctx.globalAlpha=1;

  }
 }
 draw(ctx,width,height,textures,groundY,scene='day'){
  const view=this.layout(width,height,groundY);this.viewport=view;this.greenPocket=textures.greenPocket;this.sweptImage=textures.swept;
  if(textures.swept){
   const ratio=Math.min(1.5,globalThis.devicePixelRatio||1),key=[width,height,view.groundY,scene,ratio].join(':');
   if(!this.backdrop||this.backdrop.key!==key||this.backdrop.textures!==textures){
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(width*ratio);canvas.height=Math.ceil(height*ratio);const g=canvas.getContext('2d');g.scale(ratio,ratio);
    this.drawBackdrop(g,view,textures,scene);this.backdrop={key,textures,canvas};
   }
   ctx.drawImage(this.backdrop.canvas,0,0,width,height);
  }else this.drawBackdrop(ctx,view,textures,scene);
  if(textures.swept){
   let batched=!this.reduced;
   if(batched)for(let i=0;i<this.sweptLayers.length;i++){
    const layer=this.sweptLayers[i],p=this.sweptRect(layer,view),image=this.textureForScene(this.sweptImage,{z:layer.spec[3]},{x:p.x+p.w/2},view,scene);
    if(!this.drawSweptMesh(ctx,image,layer,p,view,{first:i===0,last:i===this.sweptLayers.length-1})){batched=false;break}
   }
   if(!batched)for(const layer of this.sweptLayers)this.drawSwept(ctx,layer,view,scene);
  }
  for(const t of this.tufts.filter(t=>t.foliage)){const {x,root,h}=this.project(t,view);this.drawFoliage(ctx,t,x,root,h,true)}
  for(const p of this.seeds){const anchor=this.project({x:p.x,z:clamp((p.y-185)/500,0,1),size:92+clamp((p.y-185)/500,0,1)*245,width:1},view);ctx.globalAlpha=Math.min(1,(4-p.age)*.6)*.6;ctx.fillStyle='#ac718b';ctx.beginPath();ctx.ellipse(anchor.x,anchor.root-anchor.h*.6,1.5,.65,.5,0,Math.PI*2);ctx.fill()}
  ctx.globalAlpha=1;
 }
}

const CanopySurface=(()=>{
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function distance(x,y,a,b){const dx=b.sx-a.sx,dy=b.sy-a.sy,n=dx*dx+dy*dy,t=n?clamp(((x-a.sx)*dx+(y-a.sy)*dy)/n,0,1):0;return Math.hypot(x-a.sx-dx*t,y-a.sy-dy*t)}
// A near-view foliage surface. Local deformation is spatial, not whole-image translation.
class CanopySurface{
 constructor(){this.reset()}
 reset(){this.cols=12;this.rows=14;this.time=0;this.gusts=[];this.nodes=[];for(let y=0;y<=this.rows;y++)for(let x=0;x<=this.cols;x++)this.nodes.push({u:x/this.cols,v:y/this.rows,x:0,y:0,vx:0,vy:0,kx:0,ky:0,edge:x===0||x===this.cols||y===0||y===this.rows});this.view=null}
 setReduced(){this.time=0;this.gusts=[];for(const n of this.nodes)n.x=n.y=n.vx=n.vy=n.kx=n.ky=0}
 resize(width,height){this.view={width,height,pad:36}}
 position(n){const {width,height,pad}=this.view;return{x:-pad+n.u*(width+pad*2)+n.x,y:-pad+n.v*(height+pad*2)+n.y}}
 drag(a,b){if(!this.view||![a.sx,a.sy,b.sx,b.sy].every(Number.isFinite))return;const {width}=this.view,r=clamp(width*.15,65,135),dx=b.sx-a.sx,dy=b.sy-a.sy;for(const n of this.nodes){if(n.edge)continue;const p=this.position(n),d=distance(p.x,p.y,a,b);if(d>=r)continue;const w=(1-d/r)**2;n.kx=clamp(n.kx+dx*w*5,-170,170);n.ky=clamp(n.ky+dy*w*4,-130,130)}}
 breeze(){this.gusts.push(this.time)}
 step(dt,ambient=true){this.time+=dt;this.gusts=this.gusts.filter(t=>this.time-t<6);for(const n of this.nodes){if(n.edge)continue;const phase=n.u*7-n.v*4-this.time*.8;let tx=ambient?5*Math.sin(phase)+2*Math.sin(n.v*9-this.time*.43):0,ty=ambient?2*Math.sin(phase+.8):0;for(const g of this.gusts){const d=(n.u-(this.time-g)*.3+.3)/.25;tx+=12*Math.exp(-d*d*2);ty-=3*Math.exp(-d*d*2)}n.vx+=n.kx;n.vy+=n.ky;n.kx=n.ky=0;n.vx+=(20*(tx-n.x)-8.6*n.vx)*dt;n.vy+=(20*(ty-n.y)-8.6*n.vy)*dt;n.x=clamp(n.x+n.vx*dt,-28,28);n.y=clamp(n.y+n.vy*dt,-22,22)}}
 triangle(ctx,im,s,d,crop){
  const [p,q,r]=s,[a,b,c]=d,det=(q.x-p.x)*(r.y-p.y)-(r.x-p.x)*(q.y-p.y);if(!det)return;
  const m0=((b.x-a.x)*(r.y-p.y)-(c.x-a.x)*(q.y-p.y))/det,m2=((c.x-a.x)*(q.x-p.x)-(b.x-a.x)*(r.x-p.x))/det,m1=((b.y-a.y)*(r.y-p.y)-(c.y-a.y)*(q.y-p.y))/det,m3=((c.y-a.y)*(q.x-p.x)-(b.y-a.y)*(r.x-p.x))/det;
  ctx.save();const cx=(a.x+b.x+c.x)/3,cy=(a.y+b.y+c.y)/3;ctx.beginPath();for(let i=0;i<3;i++){const t=d[i],dx=t.x-cx,dy=t.y-cy,l=Math.hypot(dx,dy)||1,x=t.x+dx/l*.45,y=t.y+dy/l*.45;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.clip();ctx.transform(m0,m1,m2,m3,a.x-m0*p.x-m2*p.y,a.y-m1*p.x-m3*p.y);const sx=Math.max(0,crop.x-3),sy=Math.max(0,crop.y-3),sw=Math.min(im.width-sx,crop.w+6),sh=Math.min(im.height-sy,crop.h+6);ctx.drawImage(im,sx,sy,sw,sh,sx,sy,sw,sh);ctx.restore();
 }
 draw(ctx,im,width,height,scene){if(!im)return;if(!this.view||this.view.width!==width||this.view.height!==height)this.resize(width,height);const pad=this.view.pad,scale=Math.max((width+pad*2)/im.width,(height+pad*2)/im.height),sw=(width+pad*2)/scale,sh=(height+pad*2)/scale,ox=(im.width-sw)/2,oy=(im.height-sh)/2;
  const source=n=>({x:ox+n.u*sw,y:oy+n.v*sh}),dest=this.nodes.map(n=>this.position(n));ctx.save();
  for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){const i=y*(this.cols+1)+x,j=i+1,k=i+this.cols+1,l=k+1,a=source(this.nodes[i]),b=source(this.nodes[j]),c=source(this.nodes[k]),d=source(this.nodes[l]),crop={x:a.x,y:a.y,w:b.x-a.x,h:c.y-a.y};this.triangle(ctx,im,[a,b,c],[dest[i],dest[j],dest[k]],crop);this.triangle(ctx,im,[b,d,c],[dest[j],dest[l],dest[k]],crop)}
  if(scene!=='day'){ctx.fillStyle=scene==='moon'?'rgba(14,38,48,.60)':'rgba(56,83,75,.19)';ctx.fillRect(0,0,width,height)}ctx.restore();
 }
 get active(){return this.gusts.length>0||this.nodes.some(n=>Math.abs(n.x)+Math.abs(n.y)+Math.abs(n.vx)+Math.abs(n.vy)+Math.abs(n.kx)+Math.abs(n.ky)>.001)}
}

return CanopySurface;})();
// One atlas and one draw call for the overlapping, independently bending tufts.
class GrassMesh{
 constructor(){
  this.canvas=document.createElement('canvas');const gl=this.canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true});if(!gl)throw new Error('WebGL unavailable');this.gl=gl;
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 position;attribute vec2 uv;attribute float opacity;uniform vec2 viewport;varying vec2 texcoord;varying float alpha;void main(){texcoord=uv;alpha=opacity;gl_Position=vec4(position.x/viewport.x*2.0-1.0,1.0-position.y/viewport.y*2.0,0.0,1.0);}'));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D image;varying vec2 texcoord;varying float alpha;void main(){gl_FragColor=texture2D(image,texcoord)*alpha;}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  this.program=program;this.buffer=gl.createBuffer();this.texture=gl.createTexture();this.position=gl.getAttribLocation(program,'position');this.uv=gl.getAttribLocation(program,'uv');this.opacity=gl.getAttribLocation(program,'opacity');this.viewport=gl.getUniformLocation(program,'viewport');this.entries=new Map();this.data=new Float32Array(0);this.lost=false;
  this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true});
 }
 atlas(items){
  const images=[...new Set(items.map(t=>t.image))];if(images.every(im=>this.entries.has(im)))return;
  const gl=this.gl,size=256,pad=2,cols=Math.min(8,Math.max(1,Math.ceil(Math.sqrt(images.length)))),rows=Math.ceil(images.length/cols),atlas=document.createElement('canvas');atlas.width=cols*size;atlas.height=rows*size;if(Math.max(atlas.width,atlas.height)>gl.getParameter(gl.MAX_TEXTURE_SIZE))throw new Error('Grass atlas too large');const g=atlas.getContext('2d');this.entries.clear();
  images.forEach((im,i)=>{const x=i%cols*size+pad,y=Math.floor(i/cols)*size+pad,w=size-2*pad,h=size-2*pad;g.drawImage(im,x,y,w,h);this.entries.set(im,{u:x/atlas.width,v:y/atlas.height,w:w/atlas.width,h:h/atlas.height})});
  gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);
 }
 draw(ctx,items,view,field){
  if(this.lost)throw new Error('Grass context lost');this.atlas(items);
  const gl=this.gl,ratio=Math.min(view.width<=600?1.25:1.5,globalThis.devicePixelRatio||1),w=Math.ceil(view.width*ratio),h=Math.ceil(view.height*ratio);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}
  const floats=items.length*10*6*5;if(this.data.length<floats)this.data=new Float32Array(floats);let cursor=0;
  const vertex=(x,y,u,v,alpha)=>{this.data[cursor++]=x;this.data[cursor++]=y;this.data[cursor++]=u;this.data[cursor++]=v;this.data[cursor++]=alpha};
  for(const {t,p,image,alpha} of items){const uv=this.entries.get(image),slices=10;let a=field.canopyPoint(t,p,1);
   for(let i=0;i<slices;i++){const b=field.canopyPoint(t,p,1-(i+1)/slices),left=a.x-p.w*.5,right=b.x-p.w*.5,u0=uv.u,u1=uv.u+uv.w,v0=uv.v+uv.h*i/slices,v1=uv.v+uv.h*(i+1)/slices;
    vertex(left,a.y,u0,v0,alpha);vertex(left+p.w,a.y,u1,v0,alpha);vertex(right,b.y,u0,v1,alpha);vertex(left+p.w,a.y,u1,v0,alpha);vertex(right+p.w,b.y,u1,v1,alpha);vertex(right,b.y,u0,v1,alpha);a=b;
   }
  }
  gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,this.data.subarray(0,cursor),gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(this.position);gl.vertexAttribPointer(this.position,2,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(this.uv);gl.vertexAttribPointer(this.uv,2,gl.FLOAT,false,20,8);gl.enableVertexAttribArray(this.opacity);gl.vertexAttribPointer(this.opacity,1,gl.FLOAT,false,20,16);gl.uniform2f(this.viewport,view.width,view.height);gl.drawArrays(gl.TRIANGLES,0,cursor/5);gl.flush();ctx.drawImage(this.canvas,0,0,view.width,view.height);
 }
 drawSprites(ctx,items,width,height){
  if(this.lost)throw new Error('Sprite context lost');this.atlas(items);const gl=this.gl;
  if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height}
  const needed=items.length*30;if(this.data.length<needed)this.data=new Float32Array(needed);let cursor=0;
  for(const item of items){const uv=this.entries.get(item.image);for(const i of [0,1,2,1,3,2]){const p=item.points[i];this.data[cursor++]=p.x;this.data[cursor++]=p.y;this.data[cursor++]=uv.u+(i%2)*uv.w;this.data[cursor++]=uv.v+(i>1?1:0)*uv.h;this.data[cursor++]=item.alpha}}
  gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,this.data.subarray(0,cursor),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(this.position);gl.vertexAttribPointer(this.position,2,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(this.uv);gl.vertexAttribPointer(this.uv,2,gl.FLOAT,false,20,8);gl.enableVertexAttribArray(this.opacity);gl.vertexAttribPointer(this.opacity,1,gl.FLOAT,false,20,16);gl.uniform2f(this.viewport,width,height);gl.drawArrays(gl.TRIANGLES,0,cursor/5);gl.flush();ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.drawImage(this.canvas,0,0);ctx.restore();
 }
 dispose(){(function(gl){const extension=gl.getExtension('WEBGL_lose_context');if(extension)extension.loseContext()})(this.gl);this.entries.clear()}
}

const NeedleGrassField=(()=>{
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// ImageGen small transparent tufts; roots, spatial wind and interaction follow muhly.
class NeedleGrassField extends MuhlyField{
 constructor(options={}){super(options);this.kind='needle';this.isGrass=true}
 reset(){super.reset();this.wakes=[];this.lastWake=null;
  // A tapering bank rises toward the upper-left, interlocking with the existing field.
  let seed=281150;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const sources=[...this.tufts];
  for(let i=0;i<44;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push(Object.assign({},source,{id:900+i,z:.12+random()*.43,x:u*310,bankX:-.72+u*.47,bankRoot:.38+random()*.20,bankH:.48+.24*(1-u)+random()*.12,bankW:.21+random()*.035,width:.84+random()*.22,rest:.50+.13*Math.sin(u*5)+random()*.08,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.58+random()*.20,foliage:false}))}
  // Staggered middle layers bridge the hollow between the raised left and right banks.
  for(let i=0;i<40;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push(Object.assign({},source,{id:1000+i,z:.22+random()*.37,x:220+u*440,bankX:-.34+u*.55,bankRoot:.40+random()*.19,bankH:.42+.13*Math.sin(u*Math.PI)+random()*.12,bankW:.21+random()*.035,width:.84+random()*.22,rest:.47+.12*Math.sin(u*5)+random()*.08,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.59+random()*.18,foliage:false}))}
  // Low overlapping sweeps cover the base of the raised bank with a soft transition.
  for(let i=0;i<26;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push(Object.assign({},source,{id:1100+i,z:.57+random()*.22,x:110+u*560,bankX:-.48+u*.76,bankRoot:.22+random()*.19,bankH:.31+random()*.17,bankW:.22+random()*.03,width:.87+random()*.20,rest:.22+random()*.18,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.57+random()*.18,foliage:false}))}
  // Low staggered fringe conceals repeated bundled bases, without a straight bottom edge.
  for(let i=0;i<34;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push(Object.assign({},source,{id:1200+i,z:.96+random()*.04,x:u*900,bankX:-.59+u*1.16,bankRoot:-.012+random()*.064,bankH:.13+random()*.12,bankW:.10+random()*.035,width:.82+random()*.24,rest:.13+random()*.14,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.44+random()*.18,foliage:false}))}
  // Loose lower-left infill, interleaved depths and heights rather than one flat fringe.
  for(let i=0;i<28;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push(Object.assign({},source,{id:1300+i,z:.91+random()*.09,x:u*390,bankX:-.65+u*.44,bankRoot:-.018+random()*.11,bankH:.17+random()*.15,bankW:.12+random()*.045,width:.84+random()*.20,rest:.17+random()*.16,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.48+random()*.17,foliage:false}))}
  // Targeted infill at the left-middle hollow, layered in front of the tall stems.
  for(let i=0;i<20;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push(Object.assign({},source,{id:1400+i,z:.93+random()*.07,x:100+u*150,bankX:-.43+u*.19,bankRoot:-.005+random()*.075,bankH:.23+random()*.13,bankW:.13+random()*.035,width:.86+random()*.19,rest:.14+random()*.12,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.52+random()*.17,foliage:false}))}
  // Extend only the lower-left bank, preserving the central controls' breathing room.
  for(let i=0;i<22;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push(Object.assign({},source,{id:1500+i,z:.97+random()*.03,x:u*150,bankX:-.65+u*.30,bankRoot:-.105+random()*.06,bankH:.19+random()*.11,bankW:.12+random()*.035,width:.84+random()*.20,rest:.12+random()*.15,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.50+random()*.16,foliage:false}))}
  // A small dipping edge at the extreme lower-left closes the remaining corner gap.
  for(let i=0;i<16;i++){const u=random(),source=sources[Math.floor(random()*sources.length)];this.tufts.push(Object.assign({},source,{id:1600+i,z:.98+random()*.02,x:u*90,bankX:-.64+u*.20,bankRoot:-.165+random()*.045,bankH:.15+random()*.095,bankW:.105+random()*.025,width:.85+random()*.18,rest:.12+random()*.12,bend:0,head:0,velocity:0,phase:random()*Math.PI*2,alpha:.47+random()*.15,foliage:false}))}
  for(const t of this.tufts){t.nativeArch=t.id>=900&&t.id<1100;t.curl=t.nativeArch?.025+random()*.025:t.bankX!==undefined?.14+random()*.12:0;if(t.nativeArch)t.rest=.035+random()*.06}
  // Keep blade lengths; vary root depths and bend the whole body, not only the tips.
  for(const t of this.tufts){const flow=.32+.085*Math.sin(t.x*.009-t.z*3.2);t.rest=clamp(t.rest+flow,.22,.56);t.curl=Math.max(t.curl,.09+.045*Math.sin(t.x*.013+t.z*4)**2);if(t.bankRoot!==undefined)t.bankRoot+=.045*Math.sin(t.id*1.71);else t.rootOffset=(t.rootOffset||0)+.028*Math.sin(t.id*1.71)}
  // Stagger the exposed left bank in depth and laterally without shortening its blades.
  for(const t of this.tufts)if(t.id>=900&&t.id<1000){t.bankRoot+=.075*Math.sin(t.id*2.13);t.bankX+=.024*Math.sin(t.id*1.19);t.rest=clamp(t.rest+.055*Math.sin(t.id*2.3),.22,.56)}
  // Thin the right foreground in pockets instead of leaving uniformly dense layers.
  this.tufts=this.tufts.filter(t=>{const lateral=(t.bankX==null?this.ribbonX(t.x/900,t.z):t.bankX);return !(lateral>.10&&t.z>.55&&t.id%5===2)&&!(t.z<.8&&t.id%17===6)});
  // Prune only the lowest detached wisps at the extreme left; keep the filled bank.
  this.tufts=this.tufts.filter(t=>!(t.id>=1600&&(t.bankRoot<-.145||t.id%3===1))&&!(t.id>=1500&&t.bankRoot<-.155&&t.bankX<-.43));
  for(const t of this.tufts)if(t.id>=1600)t.bankRoot+=.025;
  this.tufts=this.tufts.filter(t=>t.z>.9||t.id%9!==4);this.tufts.sort((a,b)=>a.z-b.z);
  for(const t of this.tufts){t.kick=0;t.air=0;t.airFiltered=0;t.headVelocity=0;t.frequency=7.0+(t.id%7)*.14;t.damping=.74;t.alpha*=.92}this.leaves=[]}
 layout(width,height,groundY){const view=super.layout(width,height,groundY);view.groundY+=Math.min(23,height*.025);return view}
 project(t,view){if(t.bankX===undefined)return super.project(t,view);const h=view.patchHeight*t.bankH;return{x:view.centerX+t.bankX*view.patchWidth,root:view.groundY-view.patchHeight*t.bankRoot,h,w:t.nativeArch?h*(.96+(t.width-.84)*.35):view.patchWidth*((t.bankW==null?.17:t.bankW))*t.width}}
 canopyPoint(t,p,u){
  const curl=t.curl||0,staticX=t.rest*(.42*u+.58*u*u)+curl*u**3*(1-.5*u);
  // Dynamic slope is zero at the root; the user-approved resting arc is independent.
  const sway=t.bend*u**2.4+(t.head-t.bend)*u**5;
  const lowerTip=clamp(.18*(2*t.rest*t.bend+t.bend*t.bend),-.025,.035)*u**3;
  return{x:p.x+p.h*(staticX+sway),y:p.root-p.h*u+p.h*curl*.30*u**5+p.h*lowerTip};
 }
 beginGesture(){this.lastWake=null}
 brush(){}
 sampleWind(x,z){const base=super.sampleWind(x,z);if(!this.ambient)return base;return clamp(base*.45+.40*Math.sin(x*.009-z*3.2-this.time*.95)+.13*Math.sin(x*.018+z*4-this.time*.64),-1.3,1.5)}
 drag(a,b){
  if(this.reduced||!this.viewport||![a.sx,a.sy,b.sx,b.sy].every(Number.isFinite))return;
  const dx=b.sx-a.sx,dy=b.sy-a.sy,n=dx*dx+dy*dy;if(!n)return;
  const view=this.viewport;
  for(const t of this.tufts){const p=this.project(t,view),radius=clamp(p.h*.34,25,62);let distance=Infinity;
   for(const u of [.35,.60,.85]){const point=this.canopyPoint(t,p,u),along=clamp(((point.x-a.sx)*dx+(point.y-a.sy)*dy)/n,0,1);distance=Math.min(distance,Math.hypot(point.x-a.sx-dx*along,point.y-a.sy-dy*along))}
   if(distance>=radius)continue;const weight=(1-distance/radius)**2;
   // Deposit a bounded air disturbance, never directly jump blade position or velocity.
   t.air=clamp(t.air+(dx+dy*.18)/Math.max(80,view.width*.18)*weight*1.8,-.42,.42);
  }
  const last=this.lastWake,span=(b.t-a.t)/1000,speed=Number.isFinite(span)&&span>0?Math.sqrt(n)/span:Math.sqrt(n)*60;
  if(!last||Math.hypot(b.sx-last.x,b.sy-last.y)>24||this.time-last.time>.12){
   const wake={x:(a.sx+b.sx)*.5,y:(a.sy+b.sy)*.5,direction:Math.sign(dx)||Math.sign(dy)||1,strength:.04*Math.tanh(speed/500),born:this.time};this.wakes.push(wake);if(this.wakes.length>10)this.wakes.shift();this.lastWake={x:b.sx,y:b.sy,time:this.time};
  }
 }
 step(dt=1/60){
  if(this.reduced)return;dt=clamp(dt,0,1/30);this.time+=dt;this.wind=this.wind.filter(g=>this.time-g.born<g.life);this.wakes=this.wakes.filter(g=>this.time-g.born<.85);
  const airDecay=Math.exp(-dt/.24),airFollow=1-Math.exp(-dt/.065);
  for(const t of this.tufts){
   t.air*=airDecay;t.airFiltered+=(t.air-t.airFiltered)*airFollow;
   let wakeForce=0;
   if(this.viewport&&this.wakes.length){const p=this.project(t,this.viewport),q=this.canopyPoint(t,p,.68);for(const g of this.wakes){const age=this.time-g.born,radius=42+age*55,dx=(q.x-g.x-g.direction*age*80)/radius,dy=(q.y-g.y)/radius;wakeForce+=g.direction*g.strength*Math.exp(-(dx*dx+dy*dy)*2)*Math.sin(Math.PI*age/.85)**2}}
   const target=clamp(this.sampleWind(t.x,t.z)*.10+t.airFiltered*.74+wakeForce,-.30,.30),w=t.frequency;
   t.velocity+=(w*w*(target-t.bend)-2*t.damping*w*t.velocity)*dt;t.bend=clamp(t.bend+t.velocity*dt,-.32,.32);
   const tipTarget=clamp(t.bend*1.12,-.35,.35),tipW=9.0;
   t.headVelocity+=(tipW*tipW*(tipTarget-t.head)-2*.70*tipW*t.headVelocity)*dt;t.head=clamp(t.head+t.headVelocity*dt,-.37,.37);
  }
 }
 setReduced(value){super.setReduced(value);if(value){this.wakes=[];this.lastWake=null;for(const t of this.tufts)t.kick=t.air=t.airFiltered=t.headVelocity=0}}
 textureForScene(image,t,p,view,scene){
  if(scene!=='day')return super.textureForScene(image,t,p,view,scene);
  if(!this.dayTextures)this.dayTextures=new WeakMap();if(this.dayTextures.has(image))return this.dayTextures.get(image);
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d');g.drawImage(image,0,0);g.globalCompositeOperation='source-atop';const shade=g.createLinearGradient(0,0,0,c.height);shade.addColorStop(0,'rgba(85,116,88,0)');shade.addColorStop(.32,'rgba(85,116,88,0)');shade.addColorStop(.60,'rgba(85,116,88,.12)');shade.addColorStop(.83,'rgba(75,106,83,.25)');shade.addColorStop(1,'rgba(75,106,83,.28)');g.fillStyle=shade;g.fillRect(0,0,c.width,c.height);this.dayTextures.set(image,c);return c;
 }
 trimmedBase(image,level){if(!this.trimCache)this.trimCache=new WeakMap();let levels=this.trimCache.get(image);if(!levels){levels=[];this.trimCache.set(image,levels)}if(levels[level])return levels[level];const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d');g.drawImage(image,0,0);g.globalCompositeOperation='destination-in';const fade=g.createLinearGradient(0,0,0,c.height),shift=level*.025;fade.addColorStop(0,'white');fade.addColorStop(.59+shift,'white');fade.addColorStop(.73+shift,'rgba(255,255,255,.32)');fade.addColorStop(.88+shift,'transparent');fade.addColorStop(1,'transparent');g.fillStyle=fade;g.fillRect(0,0,c.width,c.height);levels[level]=c;return c}
 draw(ctx,width,height,textures,groundY,scene='day'){
  const view=this.layout(width,height,groundY);this.viewport=view;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // Soft shared ground contact, never a separate dark oval under each bunch.
  for(let i=0;i<18;i++){const z=i/17,p=this.project({x:450,z,size:92+z*245,width:1},view);ctx.save();ctx.translate(p.x,p.root+2);ctx.scale(1,.15);const r=view.patchWidth*(.08+.05*z),g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'rgba(87,103,70,.020)');g.addColorStop(1,'rgba(87,103,70,0)');ctx.fillStyle=g;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore()}
  const items=[];
  for(const t of this.tufts){const p=this.project(t,view),margin=p.h*.9;
   if(p.x+p.w*.5+margin<0||p.x-p.w*.5-margin>width||p.root<0||p.root-p.h>height)continue;
   const source=textures[t.sprite*4+t.tone]||textures[t.tone];if(!source)continue;let im=this.textureForScene(source,t,p,view,scene);if(p.x>width*.62&&p.root>view.groundY-view.patchHeight*.16)im=this.trimmedBase(im,t.id%3);
   items.push({t,p,image:im,alpha:t.alpha*this.canopyWeight(t)*(.84+.16*t.z)});
  }
  if(!this.gpuFailed){try{if(!this.grassMesh)this.grassMesh=new GrassMesh();this.grassMesh.draw(ctx,items,view,this);ctx.restore();return}catch(e){this.gpuFailed=true;if(this.grassMesh)this.grassMesh.dispose();this.grassMesh=null}}
  ctx.imageSmoothingQuality='low';
  for(const {t,p,image:im,alpha} of items){
   ctx.globalAlpha=alpha;
   const slices=width<=600?6:10,sourceH=im.height/slices;
   for(let i=0;i<slices;i++){const a=this.canopyPoint(t,p,1-i/slices),b=this.canopyPoint(t,p,1-(i+1)/slices),height=b.y-a.y;if(height<=.05)continue;ctx.save();ctx.transform(1,0,(b.x-a.x)/height,1,a.x-p.w*.5,a.y);ctx.drawImage(im,0,i*sourceH,im.width,sourceH,0,0,p.w,height+.35);ctx.restore()}
  }
  ctx.restore();
 }
 dispose(){if(this.grassMesh)this.grassMesh.dispose();this.grassMesh=null;super.dispose()}
 get active(){return !this.reduced&&(this.ambient||this.wind.length>0||this.wakes.length>0||this.tufts.some(t=>Math.abs(t.bend)+Math.abs(t.velocity)+Math.abs(t.head)+Math.abs(t.headVelocity)+Math.abs(t.air)+Math.abs(t.airFiltered)>.0001))}
}

return NeedleGrassField;})();
// Cached small layers use a separable premultiplied-alpha blur on every browser.
// Canvas2D.filter is deliberately avoided: some iOS versions silently ignore it.
function softLayer(width,height,radius,paint){
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

// Rain lives in screen space so its depth, ground and speed survive any viewport.
const rainRandom=(i)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
class RainScene {
 constructor(){this.time=0;this.width=0;this.height=0;this.drops=[];this.impacts=[];this.wind=0;this.spawn=0;this.seed=0;this.backdrop=null;this.pools=[]}
 resize(width,height,ground){this.width=width;this.height=height;this.ground=Math.max(height*.65,Math.min(height*.84,ground));this.drops=Array.from({length:Math.min(460,Math.round(width*height/2100))},(_,i)=>this.drop(i,true));this.impacts=[];this.backdrop=null}
 drop(i,initial=false){const z=rainRandom(i*5+1),layer=z<.5?0:z<.91?1:2;return{x:rainRandom(i*5+2)*(this.width+100)-50,y:initial?rainRandom(i*5+3)*this.height:-40-rainRandom(i*5+3)*100,layer,speed:[260,490,740][layer]*(.8+rainRandom(i*5+4)*.4),length:[8,17,28][layer]*(.6+rainRandom(i*5+5)*.8),end:this.ground+rainRandom(i*7+2)*(this.height-this.ground),id:i}}
 step(dt,reduced=false){if(reduced)return;this.time+=dt;this.wind=12+Math.sin(this.time*.38)*13+Math.sin(this.time*.13)*8;
 for(let i=0;i<this.drops.length;i++){const d=this.drops[i];d.prevY=d.y;d.x+=this.wind*(.5+d.layer*.4)*dt;d.y+=d.speed*dt;if(d.y>d.end){if(d.layer===1&&this.impacts.length<45)this.impacts.push({x:d.x,y:d.end,age:0,water:this.inWater(d.x,d.end),size:.5+(d.end-this.ground)/(this.height-this.ground)});this.drops[i]=this.drop(++this.seed+900,false)}}
 for(const p of this.impacts)p.age+=dt;this.impacts=this.impacts.filter(p=>p.age<1.1)}
 inWater(){return false}

 makeBackdrop(){const c=document.createElement('canvas');c.width=Math.round(this.width);c.height=Math.round(this.height);const g=c.getContext('2d'),w=this.width,h=this.height,ground=this.ground;
 const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#8d9f9e');sky.addColorStop(.48,'#b6c5bf');sky.addColorStop(1,'#84958a');g.fillStyle=sky;g.fillRect(0,0,w,h);
 // Soft, irregular distant crowns, drawn once rather than blurred every frame.
 for(let band=0;band<2;band++){const layer=softLayer(w,h,band?7:15,d=>{d.globalAlpha=band?.2:.14;d.fillStyle=band?'#45665a':'#59796a';for(let i=0;i<16;i++){const x=(i/14)*w-w*.05,y=ground-h*(band?.08:.15)+rainRandom(i+30)*h*.08;d.beginPath();d.ellipse(x,y,w*(.035+rainRandom(i+22)*.045),h*(.07+rainRandom(i+40)*.09),0,0,Math.PI*2);d.fill()}});g.drawImage(layer,0,0,w,h)}
 const mist=g.createLinearGradient(0,ground-h*.25,0,ground+h*.05);mist.addColorStop(0,'rgba(204,215,207,0)');mist.addColorStop(.63,'rgba(204,215,207,.57)');mist.addColorStop(1,'rgba(204,215,207,0)');g.fillStyle=mist;g.fillRect(0,ground-h*.25,w,h*.3);
 const floor=g.createLinearGradient(0,ground-25,0,h);floor.addColorStop(0,'rgba(116,135,121,0)');floor.addColorStop(.24,'rgba(104,123,108,.58)');floor.addColorStop(1,'#6e8275');g.fillStyle=floor;g.fillRect(0,ground-25,w,h-ground+25);
 // Broken horizontal marks suggest damp earth without a hard horizon.
 for(let i=0;i<210;i++){const x=rainRandom(i+700)*w,y=ground+rainRandom(i+1300)*(h-ground);g.strokeStyle=i%3?'rgba(47,78,59,.06)':'rgba(209,222,208,.1)';g.lineWidth=.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+2+rainRandom(i+1900)*17,y);g.stroke()}
 this.backdrop=c}
 background(ctx,reduced=false){if(!this.backdrop)this.makeBackdrop();ctx.drawImage(this.backdrop,0,0,this.width,this.height);if(!reduced)this.streaks(ctx,0);}
 streaks(ctx,layer){ctx.save();ctx.lineCap='round';ctx.lineWidth=[.55,.8,1.25][layer];ctx.strokeStyle=['rgba(220,233,225,.2)','rgba(229,241,233,.37)','rgba(235,245,237,.26)'][layer];ctx.beginPath();for(const d of this.drops){if(d.layer!==layer||d.leafHit)continue;const dx=this.wind*(.5+layer*.4)/d.speed*d.length;ctx.moveTo(d.x-dx,d.y-d.length);ctx.lineTo(d.x,d.y)}ctx.stroke();ctx.restore()}
 drawImpacts(ctx,reduced=false){if(reduced)return;ctx.save();for(const p of this.impacts){const t=p.age/1.1,s=p.size;
 // Perspective-flattened wavelets spread from each actual rain landing point.
 for(let ring=0;ring<2;ring++){const q=t-ring*.16;if(q<=0)continue;const r=(1+18*Math.pow(q,.72))*s,alpha=Math.min(1,q*12)*Math.pow(1-q,1.6)*(ring?.19:.38);ctx.globalAlpha=alpha;ctx.lineWidth=ring?.5:.7;ctx.strokeStyle='#e0ece0';ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.23,0,.08,Math.PI-.08);ctx.stroke();ctx.globalAlpha=alpha*.6;ctx.strokeStyle='#395a4a';ctx.beginPath();ctx.ellipse(p.x,p.y+.5,r,r*.23,0,Math.PI+.08,Math.PI*2-.08);ctx.stroke()}
 if(p.age<.22){const q=p.age/.22,r=q*3*s,y=p.y-Math.sin(q*Math.PI)*2.5*s;ctx.globalAlpha=(1-q)*.28;ctx.strokeStyle='#deebe0';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.x-r,y);ctx.lineTo(p.x-r-.8,y-1);ctx.moveTo(p.x+r,y);ctx.lineTo(p.x+r+.8,y-1);ctx.stroke()}}ctx.restore()}

 foreground(ctx,reduced=false){this.drawImpacts(ctx,reduced);if(!reduced){this.streaks(ctx,1);this.streaks(ctx,2)}}
 reset(){this.time=0;this.impacts=[];this.seed=0;if(this.width)this.resize(this.width,this.height,this.ground)}
}

class MoonScene {
 constructor(){this.backdrop=null;this.tones=new WeakMap();this.highlights=new WeakMap()}
 resize(w,h,root){this.w=w;this.h=h;this.root=root;this.backdrop=null;this.shadowMask=null}
 reset(){this.shadowMask=null}
 exposure(l){const x=Math.max(0,Math.min(1,l.x/900)),y=Math.max(0,Math.min(1,l.y/740));const side=.72*(1-x)+.28*(1-y),patch=.08*Math.sin(l.x*.012+l.y*.007);return Math.max(0,Math.min(1,(side-.16)*1.45+patch))*(l.layer==='back'?.48:1)}
 leaf(im,l,species){if(!im)return im;let tones=this.tones.get(im);if(!tones){tones=[];this.tones.set(im,tones)}const level=Math.min(5,Math.floor(this.exposure(l)*6));if(tones[level])return tones[level];const c=document.createElement('canvas'),ratio=Math.min(1,384/Math.max(im.width,im.height));c.width=Math.max(1,Math.round(im.width*ratio));c.height=Math.max(1,Math.round(im.height*ratio));const g=c.getContext('2d'),v=level/5,brightness=species==='willow'?.93+v*.16:.84+v*.23+(species==='jacaranda'?.055:0);if(species==='willow'){g.drawImage(im,0,0,c.width,c.height);g.globalCompositeOperation='source-atop';g.fillStyle=brightness<1?`rgba(0,0,0,${1-brightness})`:`rgba(235,244,220,${(brightness-1)*.5})`;g.fillRect(0,0,c.width,c.height)}else{g.filter=`saturate(1) brightness(${brightness})`;g.drawImage(im,0,0,c.width,c.height);g.filter='none';}g.globalCompositeOperation='source-atop';g.fillStyle=`rgba(65,95,132,${species==='willow'?.012+(1-v)*.018:.02+(1-v)*.035})`;g.fillRect(0,0,c.width,c.height);const sheen=g.createLinearGradient(0,0,c.width,c.height);sheen.addColorStop(0,`rgba(223,238,237,${v*.075})`);sheen.addColorStop(.55,'rgba(223,238,237,0)');g.fillStyle=sheen;g.fillRect(0,0,c.width,c.height);tones[level]=c;return c}
 lighting(angle){const a=-2.05-angle;return {x:Math.cos(a),y:Math.sin(a)}}
 highlight(im,angle){let masks=this.highlights.get(im);if(!masks){masks=[];this.highlights.set(im,masks)}const bin=((Math.round(angle/(Math.PI/8))%16)+16)%16;if(masks[bin])return masks[bin];const size=128,c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),d=this.lighting(bin*Math.PI/8);
 g.drawImage(im,0,0,size,size);g.globalCompositeOperation='destination-out';g.drawImage(im,-d.x*2,-d.y*2,size,size);g.globalCompositeOperation='source-in';g.fillStyle='rgba(215,235,240,.75)';g.fillRect(0,0,size,size);
 const sheen=document.createElement('canvas');sheen.width=sheen.height=size;const r=sheen.getContext('2d');r.drawImage(im,0,0,size,size);r.globalCompositeOperation='source-in';const grad=r.createLinearGradient(64+d.x*60,64+d.y*60,64-d.x*60,64-d.y*60);grad.addColorStop(0,'rgba(214,233,236,.23)');grad.addColorStop(.25,'rgba(214,233,236,.10)');grad.addColorStop(.55,'rgba(214,233,236,0)');r.fillStyle=grad;r.fillRect(0,0,size,size);g.globalCompositeOperation='source-over';g.drawImage(sheen,0,0);masks[bin]=c;return c}
 glint(ctx,l,im,w,h,species){if(l.layer==='back'||!['attached','loosening','growing'].includes(l.state))return;const response=Math.pow(Math.max(0,Math.cos(l.angle*.7+2.05)),6),alpha=ctx.globalAlpha;ctx.globalAlpha*=Math.pow(this.exposure(l),2)*(.08+response*.4);ctx.drawImage(this.highlight(im,l.angle),-w*(species==='willow'?.34:.5),species==='willow'?-h*.1:species==='jacaranda'?-h*.5:-h*.85,species==='willow'?w*.68:w,h);ctx.globalAlpha=alpha}

 background(ctx){if(!this.backdrop){const c=document.createElement('canvas');c.width=this.w;c.height=this.h;const g=c.getContext('2d'),w=this.w,h=this.h,root=this.root;
 const sky=g.createLinearGradient(0,0,w,h);sky.addColorStop(0,'#405d7a');sky.addColorStop(.4,'#233e59');sky.addColorStop(1,'#193348');g.fillStyle=sky;g.fillRect(0,0,w,h);
 const light=g.createRadialGradient(-w*.1,-h*.12,0,-w*.1,-h*.12,Math.max(w,h)*1.05);light.addColorStop(0,'rgba(226,233,229,.15)');light.addColorStop(.5,'rgba(210,223,222,.045)');light.addColorStop(1,'rgba(210,223,222,0)');g.fillStyle=light;g.fillRect(0,0,w,h);
 for(let i=0;i<7;i++){g.fillStyle='rgba(226,231,223,.18)';g.beginPath();g.arc(((i*137+74)%997)/997*w,((i*97+45)%641)/641*h*.45,.55,0,Math.PI*2);g.fill()}
 // Far foliage is a soft dark layer; the ground shares the same upper-left light.
 const distant=softLayer(w,h,18,d=>{d.fillStyle='rgba(29,48,62,.18)';for(let i=0;i<12;i++){d.beginPath();d.ellipse(i*w/10,root-20-Math.sin(i*1.7)*16,w*.06,35+Math.sin(i*2.3)*14,0,0,Math.PI*2);d.fill()}});g.drawImage(distant,0,0,w,h);
 const floor=g.createLinearGradient(0,root-40,0,h);floor.addColorStop(0,'rgba(69,83,91,0)');floor.addColorStop(.35,'rgba(43,67,81,.4)');floor.addColorStop(1,'rgba(23,47,62,.8)');g.fillStyle=floor;g.fillRect(0,root-40,w,h-root+40);
 const groundLight=softLayer(w,h,20,d=>{const wash=d.createLinearGradient(0,root,w*.8,h);wash.addColorStop(0,'rgba(224,229,213,.10)');wash.addColorStop(.6,'rgba(205,218,212,.04)');wash.addColorStop(1,'rgba(205,218,212,0)');d.fillStyle=wash;d.beginPath();d.moveTo(-40,root-8);d.quadraticCurveTo(w*.26,root-15,w*.51,root+18);d.lineTo(w*.95,h+30);d.lineTo(-40,h+30);d.closePath();d.fill();});g.drawImage(groundLight,0,0,w,h);this.backdrop=c}ctx.drawImage(this.backdrop,0,0,this.w,this.h)}
 shadow(ctx,plant,root){
 // A cached contact shadow avoids synchronous readback of the animated tree.
 if(!this.shadowMask){const c=document.createElement('canvas');c.width=this.w;c.height=this.h;const g=c.getContext('2d');g.translate(this.w*.5,root+8);g.transform(1,.06,.7,.19,0,0);const radius=Math.min(this.w*.46,Math.max(50,(this.h-root)*2)),fade=g.createRadialGradient(0,0,0,radius*.35,0,radius);fade.addColorStop(0,'rgba(0,0,0,.10)');fade.addColorStop(.35,'rgba(0,0,0,.065)');fade.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=fade;g.fillRect(-radius,-radius,radius*3,radius*2);this.shadowMask=c}
 ctx.drawImage(this.shadowMask,0,0,this.w,this.h)
 }

}

// A few hanging drops, anchored to the lowest visible edge of their actual leaf sprites.
class LeafWater {
 constructor(){this.bound=null;this.drops=[];this.falling=[];this.outlines=new WeakMap();this.time=0;this.hits=[];this.targets=[];this.lastRainShed=-3}
 reset(){this.bound=null;this.drops=[];this.falling=[];this.time=0;this.hits=[];this.targets=[];this.lastRainShed=-3}
 bind(sim){if(this.bound===sim)return;this.reset();this.bound=sim;if(sim.kind==='muhly'||sim.isGrass)return;this.targets=sim.leaves.filter((l,i)=>i%17===0&&l.layer!=='back').slice(0,180);const candidates=sim.leaves.filter(l=>l.state==='attached'&&l.y>120&&l.y<560);for(let i=0;i<candidates.length&&this.drops.length<14;i++){const l=candidates[(i*137)%candidates.length];if(this.drops.some(d=>Math.hypot(d.leaf.x-l.x,d.leaf.y-l.y)<58))continue;this.drops.push({leaf:l,x:l.x,y:l.y,fill:.06+(l.id%11)/36,cooldown:0,ready:false})}}
 hitRain(rain,ox,oy,scale,reduced=false){if(reduced)return;for(const p of rain.drops){if(p.layer!==1||p.leafHit||p.prevY===undefined||p.y<p.prevY)continue;const x=(p.x-ox)/scale,from=(p.prevY-oy)/scale,to=(p.y-oy)/scale;let best=null,nearest=Infinity;for(const l of this.targets){if(l.state!=='attached')continue;const y=l.y-l.size*.25;if(y<from||y>to||Math.abs(l.x-x)>Math.min(12,l.size*.22))continue;if(y<nearest){best=l;nearest=y}}if(best){p.leafHit=true;if(this.hits.length<16)this.hits.push({leaf:best,age:0});if(!best.fixed&&best.age>3&&this.time-this.lastRainShed>2.6&&this.bound.remaining>this.bound.leaves.length*.94){best.state='loosening';best.releaseAge=0;best.releaseDelay=.42+(best.id%5)*.035;best.rainShed=true;this.bound.regrowing=true;this.lastRainShed=this.time;}const d=this.drops.find(d=>d.leaf===best);if(d)d.fill=Math.min(1.03,d.fill+.12)}}}
 hit(l){return this.hits.find(h=>h.leaf===l)}
 outline(im){if(this.outlines.has(im))return this.outlines.get(im);const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');g.drawImage(im,0,0,48,48);const a=g.getImageData(0,0,48,48).data,points=[];for(let x=1;x<47;x+=2){let top=-1,bottom=-1;for(let y=0;y<48;y++)if(a[(y*48+x)*4+3]>110){if(top<0)top=y;bottom=y}if(top>=0){points.push([x/48,top/48],[x/48,bottom/48])}}this.outlines.set(im,points);return points}
 anchor(l,im,w,h,scale=1,willow=false){const d=this.drops.find(d=>d.leaf===l);if(!d)return;const cos=Math.cos(l.angle),sin=Math.sin(l.angle);let best=null,max=-Infinity;for(const [u,v] of (d.tip?[d.tip]:this.outline(im))){const x=(willow?(u*.68-.34):u-.5)*w*scale,y=(v-(willow?.1:.85))*h*scale,wy=x*sin+y*cos;if(wy>max){max=wy;best={x:l.x+x*cos-y*sin,y:l.y+wy,tip:[u,v]}}}if(best){d.x=best.x;d.y=best.y-.3;d.tip=best.tip;d.ready=true}}
 release(d,reduced=false){if(d.fill<.35||!d.ready)return;const r=.75+Math.cbrt(Math.min(1,d.fill))*1.15;if(!reduced&&this.falling.length<45)this.falling.push({x:d.x,y:d.y+r,vy:14,vx:0,age:0,r});d.fill=0;d.cooldown=1.8+(d.leaf.id%7)*.18}
 touch(a,b,reduced=false){const dx=b.x-a.x,dy=b.y-a.y,n=dx*dx+dy*dy;for(const d of this.drops){const t=n?Math.max(0,Math.min(1,((d.x-a.x)*dx+(d.y-a.y)*dy)/n)):0;if(Math.hypot(d.x-a.x-t*dx,d.y-a.y-t*dy)<26)this.release(d,reduced)}}
 step(dt,reduced=false){this.time+=dt;for(const h of this.hits)h.age+=dt;this.hits=this.hits.filter(h=>!reduced&&h.age<1.15&&['attached','loosening'].includes(h.leaf.state));for(const d of this.drops){if(d.leaf.state!=='attached'){this.release(d,reduced);d.ready=false;continue}d.cooldown=Math.max(0,d.cooldown-dt);if(!d.cooldown)d.fill+=dt/(7+d.leaf.id%9);if(d.fill>=1.04)this.release(d,reduced)}if(reduced){this.falling=[];return}for(const p of this.falling){p.age+=dt;p.vy+=420*dt;p.y+=p.vy*dt;p.x+=Math.sin(this.time*.5)*dt*6}this.falling=this.falling.filter(p=>p.age<1.5&&p.y<750)}
 draw(ctx){ctx.save();for(const d of this.drops){if(!d.ready||d.fill<.08||d.leaf.state!=='attached')continue;const f=Math.min(1,d.fill),x=d.x,y=d.y;
 // A faint wet edge comes first. The bead grows out of it rather than appearing as an outlined icon.
 ctx.strokeStyle=`rgba(230,239,219,${.08+f*.12})`;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(x-1.6,y-4.5);ctx.quadraticCurveTo(x-1.1,y-1.5,x,y);ctx.stroke();
 if(f<.32)continue;const growth=(f-.32)/.68,r=.55+Math.cbrt(growth)*1.25,stretch=1+Math.max(0,(f-.88)/.12)*.5,cy=y+r*.48;
 ctx.fillStyle='rgba(192,211,195,.25)';ctx.beginPath();ctx.ellipse(x,cy,r,r*stretch,0,0,Math.PI*2);ctx.fill();
 // Small broken light/dark arcs keep most of the water transparent.
 ctx.lineWidth=.45;ctx.strokeStyle=`rgba(244,250,230,${.26+growth*.24})`;ctx.beginPath();ctx.ellipse(x,cy,r*.78,r*stretch*.8,0,Math.PI*1.05,Math.PI*1.55);ctx.stroke();
 ctx.strokeStyle='rgba(62,88,72,.26)';ctx.beginPath();ctx.ellipse(x,cy+.15,r*.85,r*stretch*.84,0,.18,Math.PI*.7);ctx.stroke();
 if(f>.9){ctx.strokeStyle='rgba(207,225,205,.3)';ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(x,y-.8);ctx.lineTo(x,cy-r*stretch*.6);ctx.stroke()}}
 for(const p of this.falling){ctx.globalAlpha=Math.max(0,1-p.age/1.5)*.55;ctx.fillStyle='rgba(203,224,210,.58)';ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*.68,p.r*(1+Math.min(.45,p.vy/700)),0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(240,250,234,.65)';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(p.x-.35,p.y-p.r*.5);ctx.lineTo(p.x-.5,p.y);ctx.stroke()}ctx.restore()}
}

// A small warm-season population, kept near sheltered lower vegetation.
class Fireflies {
 constructor(){this.flies=[];this.time=0;this.kind=null}
 configure(kind,night){this.kind=night&&['willow','jacaranda'].includes(kind)?kind:null;this.reset()}
 reset(){this.time=0;this.flies=[];if(!this.kind)return;const count=this.kind==='willow'?10:7;for(let i=0;i<count;i++){const x=190+((i*173+83)%520),y=495+((i*79+37)%213);this.flies.push({id:i,homeX:x,homeY:y,x,y,vx:0,vy:0,phase:i*2.399,back:i%3===0})}}
 step(dt,reduced){if(reduced)return;this.time+=dt;for(const f of this.flies){const x=f.homeX+Math.sin(this.time*.28+f.phase)*27,y=f.homeY+Math.sin(this.time*.39+f.phase*1.7)*17;f.vx+=((x-f.x)*.75-f.vx*1.6)*dt;f.vy+=((y-f.y)*.75-f.vy*1.6)*dt;f.x+=f.vx*dt;f.y+=f.vy*dt}}
 disturb(a,b,reduced){if(reduced)return;const dx=b.x-a.x,dy=b.y-a.y,n=dx*dx+dy*dy;for(const f of this.flies){const t=n?Math.max(0,Math.min(1,((f.x-a.x)*dx+(f.y-a.y)*dy)/n)):0,x=f.x-a.x-t*dx,y=f.y-a.y-t*dy,d=Math.hypot(x,y);if(d>85)continue;const k=(1-d/85)*32,angle=d>1?Math.atan2(y,x):f.phase;f.vx=Math.max(-60,Math.min(60,f.vx+Math.cos(angle)*k));f.vy=Math.max(-60,Math.min(60,f.vy+Math.sin(angle)*k-12))}}
 brightness(f,reduced){return reduced?.32:.06+.94*Math.pow(Math.max(0,Math.sin(this.time*(.78+f.id*.023)+f.phase)),7)}
 draw(ctx,ox,oy,scale,back,reduced){if(!this.flies.length)return;ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);for(const f of this.flies){if(f.back!==back)continue;const a=this.brightness(f,reduced)*(back?.64:1),r=back?6:9,g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,r);g.addColorStop(0,`rgba(222,240,151,${a*.35})`);g.addColorStop(.3,`rgba(202,226,123,${a*.13})`);g.addColorStop(1,'rgba(202,226,123,0)');ctx.fillStyle=g;ctx.fillRect(f.x-r,f.y-r,r*2,r*2);ctx.fillStyle=`rgba(235,247,178,${a})`;ctx.beginPath();ctx.ellipse(f.x,f.y,back?.85:1.25,back?1:1.65,.35,0,Math.PI*2);ctx.fill()}ctx.restore()}
 get active(){return this.flies.length>0}
}

// A single silent gesture demonstrates the same local wind as the user's swipe.
class SwipeHint {
 constructor(storage){this.storage=storage;this.state='waiting';this.time=0;this.points=[];try{if(storage&&storage.getItem('tree-swipe-hint-seen')==='1')this.state='done'}catch(e){}}
 remember(){try{if(this.storage)this.storage.setItem('tree-swipe-hint-seen','1')}catch(e){}}
 dismiss(){this.state='done';this.points=[];this.remember()}
 start(sim,reduced=false){if(this.state!=='waiting')return false;if(reduced||sim.isGrass){this.state='done';return false}let leaf=null,distance=Infinity;for(const l of sim.leaves){if(l.state!=='attached'||l.layer==='back')continue;const d=Math.hypot(l.x-650,l.y-350);if(d<distance){leaf=l;distance=d}}if(!leaf){this.state='done';return false}this.center={x:leaf.x,y:leaf.y-leaf.size*.2};this.state='playing';this.time=0;this.points=[];this.remember();return true}
 position(t){const u=Math.max(0,Math.min(1,t/1.05)),p=u*u*(3-2*u);return{x:this.center.x-54+108*p,y:this.center.y+14-28*p-15*Math.sin(p*Math.PI)}}
 step(dt,sim){if(!this.active)return;const before=this.time;this.time+=dt;if(before<1.05){const a=this.position(before),b=this.position(this.time),strength=Math.sin(Math.PI*Math.min(1,this.time/1.05));sim.emit(a,b,{x:400*strength,y:-150*strength});this.points.push({x:b.x,y:b.y,at:this.time})}this.points=this.points.filter(p=>this.time-p.at<.38);if(this.time>=1.6){this.state='done';this.points=[]}}
 draw(ctx,ox,oy,scale,moon){if(this.points.length<2)return;ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.lineWidth=1.3/scale;ctx.lineCap='round';const color=moon?'214,231,220':'66,102,78',fade=Math.min(1,this.time/.18);for(let i=1;i<this.points.length;i++){const a=this.points[i-1],b=this.points[i],alpha=Math.max(0,1-(this.time-b.at)/.38)*.3*fade;ctx.strokeStyle=`rgba(${color},${alpha})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.restore()}
 get active(){return this.state==='playing'}
}

const isGrass=()=>species==='muhly'||species==='needle';
const makeSimulation=kind=>kind==='needle'?new NeedleGrassField():kind==='muhly'?new MuhlyField():new Study(kind);
const canvas=document.querySelector('#scene');let ctx=canvas.getContext('2d');const displayCtx=ctx,plantCanvas=document.createElement('canvas'),plantCtx=plantCanvas.getContext('2d');let species='maple',sim=makeSimulation(species);const audio=new WindAudio();document.querySelector('main').dataset.species=species;
let hintStorage;try{hintStorage=localStorage}catch(e){}const swipeHint=new SwipeHint(hintStorage);const fireflies=new Fireflies();const moon=new MoonScene();let moonlit=false;const instrument=new BranchInstrument();const water=new LeafWater();const rain=new RainScene();let rainy=false;
const sprites=await Promise.all([1,4,7,11,18].map(i=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=`assets/leaf-${String(i).padStart(2,'0')}.png`})));
// Pre-tinted leaf variants preserve texture and alpha without per-frame filters.
const leafTones=sprites.map(im=>{if(!im)return[];return ['rgba(118,133,66,.40)','rgba(236,194,72,.48)','rgba(231,150,52,.57)','rgba(210,104,40,.67)','rgba(172,65,44,.73)'].map(color=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,c.width,c.height);return c})});
function tinted(im,color){if(!im)return null;const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,c.width,c.height);return c}
const wetSprites=new WeakMap();
function wetImage(im){if(!im)return im;if(!wetSprites.has(im))wetSprites.set(im,tinted(tinted(im,'rgba(81,111,126,.08)'),'rgba(20,30,38,.06)'));return wetSprites.get(im)}
const sheenCache=new WeakMap();
function wetSheen(im){if(sheenCache.has(im))return sheenCache.get(im);const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
 const glow=g.createLinearGradient(15,110,95,5);glow.addColorStop(0,'rgba(238,246,231,0)');glow.addColorStop(.4,'rgba(238,246,231,.02)');glow.addColorStop(.58,'rgba(238,246,231,.55)');glow.addColorStop(.72,'rgba(238,246,231,.08)');glow.addColorStop(1,'rgba(238,246,231,0)');g.fillStyle=glow;g.fillRect(0,0,128,128);
 for(let i=0;i<5;i++){g.strokeStyle=`rgba(241,248,237,${.12+i*.025})`;g.lineWidth=1.2;g.beginPath();g.moveTo(34+i*9,84-i*4);g.quadraticCurveTo(46+i*8,61-i*3,51+i*8,39+i*2);g.stroke()}
 g.globalCompositeOperation='destination-in';g.drawImage(im,0,0,128,128);sheenCache.set(im,c);return c}
const mapleSun=sprites.map(im=>tinted(im,'rgba(255,239,164,.38)'));
const loadImage=src=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src});
const muhlyImages=await Promise.all(['assets/muhly-panicles-v1.png','assets/muhly-panicles-open-v1.png'].map(loadImage));
const muhlyTextures=[];
{
 const source=await loadImage('assets/muhly-swept-canopy-v1.png');
 if(source){const patch=document.createElement('canvas');patch.width=1024;patch.height=Math.round(1024*source.height/source.width);const g=patch.getContext('2d');g.filter='blur(.5px)';g.drawImage(source,0,0,patch.width,patch.height);g.filter='none';g.globalCompositeOperation='source-atop';g.fillStyle='rgba(245,207,217,.18)';g.fillRect(0,0,patch.width,patch.height);g.globalCompositeOperation='destination-in';const fade=g.createLinearGradient(0,0,0,patch.height);fade.addColorStop(0,'white');fade.addColorStop(.58,'white');fade.addColorStop(.80,'rgba(255,255,255,.55)');fade.addColorStop(1,'transparent');g.fillStyle=fade;g.fillRect(0,0,patch.width,patch.height);const pixels=g.getImageData(0,0,patch.width,patch.height).data,mask={width:64,height:32,data:[]};for(let y=0;y<32;y++)for(let x=0;x<64;x++)mask.data.push(pixels[(Math.floor((y+.5)*patch.height/32)*patch.width+Math.floor((x+.5)*patch.width/64))*4+3]);patch.hitAlpha=mask;muhlyTextures.swept=patch}
}
muhlyTextures.greenPocket=await loadImage('assets/muhly-green-pocket-v3.png');
for(const image of muhlyImages)for(const color of ['rgba(184,111,145,.1)','rgba(209,151,174,.08)','rgba(153,111,143,.14)','rgba(255,225,219,.1)']){if(!image){muhlyTextures.push(null);continue}const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.filter='blur(1.3px)';g.drawImage(image,0,0,512,512);g.filter='none';g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,512,512);g.globalCompositeOperation='destination-in';const rootFade=g.createLinearGradient(0,0,0,512);rootFade.addColorStop(0,'#fff');rootFade.addColorStop(.68,'#fff');rootFade.addColorStop(.80,'rgba(255,255,255,.68)');rootFade.addColorStop(.91,'rgba(255,255,255,.06)');rootFade.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rootFade;g.fillRect(0,0,512,512);muhlyTextures.push(c)}
const needleTuft=await loadImage('assets/needle-tuft-image-v4.png');
const needleTextures=[];
for(let variant=0;variant<2;variant++)for(const color of ['rgba(126,155,105,.18)','rgba(196,210,166,.10)','rgba(107,140,95,.23)','rgba(240,242,219,.08)']){
 if(!needleTuft){needleTextures.push(null);continue}
 const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.filter='blur(.65px)';
 if(variant){g.translate(512,0);g.scale(-1,1)}g.drawImage(needleTuft,0,0,512,512);g.setTransform(1,0,0,1,0,0);g.filter='none';
 g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,512,512);
 g.globalCompositeOperation='destination-in';const fade=g.createLinearGradient(0,0,0,512);fade.addColorStop(0,'white');fade.addColorStop(.55,'white');fade.addColorStop(.77,'rgba(255,255,255,.38)');fade.addColorStop(.89,'rgba(255,255,255,.035)');fade.addColorStop(.97,'transparent');fade.addColorStop(1,'transparent');g.fillStyle=fade;g.fillRect(0,0,512,512);needleTextures.push(c);
}
const ginkgoImages=await Promise.all(['ginkgo-leaf.png','ginkgo-deep.png','ginkgo-folded.png'].map(name=>loadImage('assets/'+name)));const ginkgoImage=ginkgoImages[0];
const ginkgoTones=ginkgoImages.map(im=>['rgba(210,148,43,.35)','rgba(243,175,48,.28)','rgba(255,214,89,.22)'].map(color=>tinted(im,color)));
const ginkgoSun=ginkgoImages.map(im=>tinted(im,'rgba(255,235,143,.4)'));
const jacarandaCluster=await loadImage('assets/jacaranda-cluster-muted-stems.png'),jacarandaFlower=await loadImage('assets/jacaranda-flower-light.png');
const jacarandaTones=[jacarandaCluster,tinted(jacarandaCluster,'rgba(134,111,178,.12)'),tinted(jacarandaCluster,'rgba(109,94,153,.2)')];
const jacarandaSun=tinted(jacarandaCluster,'rgba(255,253,246,.36)');
const willowImage=await loadImage('assets/willow-leaf.png');
const willowVariants=await Promise.all([0,1,2,3].map(i=>loadImage(`assets/willow-tone-${i}.png`)));
const willowTones=willowVariants.slice(0,3),willowSun=willowVariants[3];
const cherryImages=await Promise.all(['cherry-blossom.png','cherry-side.png','cherry-bud.png'].map(name=>loadImage('assets/'+name)));const cherryImage=cherryImages[0];
const cherryTones=cherryImages.map(im=>['rgba(255,255,255,.58)','rgba(255,249,251,.50)','rgba(255,237,244,.44)'].map(color=>tinted(im,color)));
const cherrySun=cherryImages.map(im=>tinted(im,'rgba(255,255,255,.65)'));
const petalImage=await new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src='assets/cherry-petal.png'});
const petalVisible=tinted(petalImage,'rgba(246,213,224,.16)');
let scale=1,leafScale=1,ox=0,oy=0,width=0,height=0,raf=0,last=null,acc=0,pointer=null,pending=[],previous=null,velocity={x:0,y:0},pulse=0,trail=[];
let willowMesh=null,willowMeshFailed=false;
let treeDirty=true,treeWasActive=false,treeRevision=0,treePaintTime=-Infinity;
const media=matchMedia('(prefers-reduced-motion: reduce)'),FRAME_STEP=1/60;sim.setReduced(media.matches);
// Cache the untouched crown, so falling leaves and wind never change the camera.
const crownFrames=new Map();
function crownFrame(kind){
 if(crownFrames.has(kind))return crownFrames.get(kind);
 const tree=new Study(kind);let left=450,right=450,top=745;
 for(const l of tree.leaves){const radius=l.size*1.2;left=Math.min(left,l.x-radius);right=Math.max(right,l.x+radius);top=Math.min(top,l.y-radius)}
 const frame={halfWidth:Math.max(450-left,right-450),height:745-top};crownFrames.set(kind,frame);return frame;
}
function resize(){treeDirty=true;fireflies.configure(species,moonlit);const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,width<=600?(species==='willow'?2:1.5):2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);plantCanvas.width=canvas.width;plantCanvas.height=canvas.height;plantCtx.setTransform(dpr,0,0,dpr,0,0);const portrait=width<=600&&height>width,frameHeight=portrait?height:height-110;scale=portrait?Math.min(width/650,frameHeight/710):Math.min(width/900,(height-160)/880);leafScale=portrait?1.18:1;ox=(width-900*scale)/2;oy=portrait?(frameHeight-800*scale)/2-12:85+((height-160)-800*scale)/2;if(portrait)oy=Math.min(oy,height-162-745*scale);const root=oy+745*scale;if(!isGrass()&&species!=='willow'){scale*=portrait||height>width?1.03:1.06;ox=(width-900*scale)/2;oy=root-745*scale}if(!isGrass()){
 const kinds=['maple','ginkgo','cherry','willow','jacaranda'];
 const frame=crownFrame(species);
 const availableHeight=Math.max(height*.3,Math.min(height*.74,height-175));
 const centerY=Math.min(height*.47,height-140-availableHeight/2);
 // Equal visual footprint, rather than equal world scale, respects each silhouette.
 let footprint=Math.sqrt(width*height*.78);
 for(const kind of kinds){const f=crownFrame(kind),area=2*f.halfWidth*f.height;
  const limit=Math.min(width*1.16/(2*f.halfWidth),availableHeight/f.height);
  footprint=Math.min(footprint,Math.sqrt(area)*limit);
 }
 leafScale=1.08;
 scale=Math.max(.01,footprint/Math.sqrt(2*frame.halfWidth*frame.height));
 if(species==='cherry'||species==='willow')scale*=1.045;
 if(species==='jacaranda')scale*=1.08;
 if(species==='ginkgo')scale*=1.04;
 const rootY=centerY+frame.height*scale/2;
 ox=width/2-450*scale;oy=rootY-745*scale;
 }previous=null;pending=[];rain.resize(width,height,oy+745*scale);moon.resize(width,height,oy+745*scale);wake()}
function world(e){const r=canvas.getBoundingClientRect();if(isGrass())return Object.assign({},sim.fromScreen(e.clientX-r.left,e.clientY-r.top,width,height,oy+745*scale),{t:e.timeStamp});return{x:(e.clientX-r.left-ox)/scale,y:(e.clientY-r.top-oy)/scale,t:e.timeStamp}}
function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame)}
function finish(){input();if(pointer!==null&&canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);pointer=null;previous=null;pending=[];velocity={x:0,y:0};wake()}
canvas.addEventListener('pointerdown',e=>{if(pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;pointer=e.pointerId;canvas.setPointerCapture(pointer);previous=world(e);pending=[];velocity={x:0,y:0};sim.beginGesture();if(moonlit)fireflies.disturb(previous,previous,sim.reduced);if(rainy){water.bind(sim);water.touch(previous,previous,sim.reduced)}wake()});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;const p=world(e);pending.push(p);if(pending.length>8)pending.shift();if(previous&&p.x>90&&p.x<810&&p.y<(isGrass()?780:550))audio.stir(Math.min(1,Math.hypot(p.x-previous.x,p.y-previous.y)/45));wake()});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(e.pointerId===pointer)finish()});window.addEventListener('blur',finish);
function input(){if(!pending.length)return;const batch=pending.splice(0),a=previous;for(const p of batch){if(species==='needle'&&previous)sim.drag(previous,p);if(previous){const dt=(p.t-previous.t)/1000;if(dt>0){const span=Math.min(.08,Math.max(.008,dt));let vx=(p.x-previous.x)/span,vy=(p.y-previous.y)/span,s=Math.min(1,1800/(Math.hypot(vx,vy)||1)),k=1-Math.exp(-span/.028);velocity.x+=(vx*s-velocity.x)*k;velocity.y+=(vy*s-velocity.y)*k}else velocity={x:0,y:0}}previous=p}if(a&&previous){if(moonlit)fireflies.disturb(a,previous,sim.reduced);if(species==='muhly'&&previous.inside===false)return;sim.brush(a,previous);for(const note of instrument.cross(sim,a,previous,performance.now()/1000))audio.playBranch(note.midi,Math.min(1,Math.hypot(velocity.x,velocity.y)/1500)*(isGrass()?.72:1));if(rainy){water.bind(sim);water.touch(a,previous,sim.reduced)}if(species==='muhly')sim.drag(a,previous,velocity);else if(species!=='needle'){const distance=Math.hypot(previous.x-a.x,previous.y-a.y),count=Math.max(1,Math.min(3,Math.ceil(distance/65)));for(let i=0;i<count;i++){const from={x:a.x+(previous.x-a.x)*i/count,y:a.y+(previous.y-a.y)*i/count},to={x:a.x+(previous.x-a.x)*(i+1)/count,y:a.y+(previous.y-a.y)*(i+1)/count};sim.emit(from,to,{x:velocity.x*2.2*Math.min(.05,(previous.t-a.t)/1000)/FRAME_STEP/count,y:velocity.y*2.2*Math.min(.05,(previous.t-a.t)/1000)/FRAME_STEP/count})}}if(previous.x>90&&previous.x<810&&previous.y<(isGrass()?780:550))audio.stir(Math.hypot(velocity.x,velocity.y)/1300);if(!sim.reduced){trail.push({x:previous.x,y:previous.y,age:0});if(trail.length>12)trail.shift()}}}
function frame(t){raf=0;const dt=last===null?FRAME_STEP:Math.min(.05,(t-last)/1000);last=t;acc+=dt;input();let n=0;while(acc>=FRAME_STEP&&n++<3){if(pulse>0){pulse-=FRAME_STEP;{const p=sim.point(sim.branches[3],.6);sim.emit({x:p.x-45,y:p.y+50},{x:p.x+25,y:p.y-40},{x:1150,y:-650})}}swipeHint.step(FRAME_STEP,sim);if(!isGrass()&&!sim.active&&pointer===null&&pulse<=0&&!swipeHint.active){sim.time+=FRAME_STEP;sim.tokens=Math.min(3,sim.tokens+FRAME_STEP*(species==='willow'?4:12));for(const l of sim.leaves)l.age+=FRAME_STEP}else sim.step(FRAME_STEP);if(moonlit)fireflies.step(FRAME_STEP,sim.reduced);if(rainy){rain.step(FRAME_STEP,sim.reduced);water.bind(sim);water.step(FRAME_STEP,sim.reduced);water.hitRain(rain,ox,oy,scale,sim.reduced)}for(const p of trail)p.age+=FRAME_STEP;trail=trail.filter(p=>p.age<.45);acc-=FRAME_STEP}render();if(pointer!==null||pulse>0||swipeHint.active||sim.active||(rainy&&!sim.reduced)||(moonlit&&fireflies.active&&!sim.reduced)||trail.length)wake();else{last=null;acc=0;if(isGrass())return;for(const b of sim.branches){b.theta=b.omega=0;if(b.restCurve){b.bend=b.bendVelocity=b.renderedBend=0;b.c=b.restCurve.map(p=>p.slice());b.renderOutline=null}}sim.transform();for(const l of sim.leaves)if(l.state==='attached')Object.assign(l,sim.anchor(l));render();}}
 function render(){
 ctx.clearRect(0,0,width,height);if(rainy)rain.background(ctx,sim.reduced);if(moonlit){moon.background(ctx);if(!isGrass())fireflies.draw(ctx,ox,oy,scale,true,sim.reduced);}if(isGrass()){sim.draw(ctx,width,height,species==='needle'?needleTextures:muhlyTextures,oy+745*scale,moonlit?'moon':rainy?'rain':'day');if(rainy)rain.foreground(ctx,sim.reduced);return}const moving=sim.active||pointer!==null||pulse>0||swipeHint.active||trail.length>0;if(treeDirty||((rainy||moving||treeWasActive)&&(!rainy||width>600||performance.now()-treePaintTime>=32))){treeDirty=false;treePaintTime=performance.now();treeRevision++;ctx=plantCtx;ctx.clearRect(0,0,width,height);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.save();const sway=sim.reduced||!rainy?0:Math.sin(rain.time*.38)*.002+Math.sin(rain.time*.13)*.001;ctx.translate(450,745);ctx.rotate(sway);ctx.translate(-450,-745);

 ctx.save();ctx.translate(454,747);ctx.scale(1,.16);const shadow=ctx.createRadialGradient(0,0,2,0,0,95);shadow.addColorStop(0,'rgba(86,105,78,.15)');shadow.addColorStop(1,'rgba(105,106,74,0)');ctx.fillStyle=shadow;ctx.fillRect(-95,-95,190,190);ctx.restore();
 // Back leaves remain independently removable, including while growing.
 const cherryBatch=species==='cherry'&&width<=600&&!willowMeshFailed&&typeof ctx.getTransform==='function';
 if(!cherryBatch||!drawCherryMesh(true))for(const l of sim.leaves)if(species!=='willow'&&['attached','loosening','growing'].includes(l.state)&&l.layer==='back')leaf(l);
 for(const b of sim.branches)drawBranch(b);
 if(cherryBatch&&drawCherryMesh(false)){}else if(species==='willow'&&width<=600&&!willowMeshFailed&&typeof ctx.getTransform==='function'){if(!drawWillowMesh())drawWillowLeaves()}else if(species==='willow'&&!rainy&&typeof ctx.getTransform==='function')drawWillowLeaves();else for(const l of sim.leaves){if(!['attached','loosening','growing'].includes(l.state)||(species!=='willow'&&l.layer==='back'))continue;const b=sim.branches[l.branch],p=sim.point(b,l.t);if(species!=='cherry'&&species!=='willow'&&species!=='jacaranda'&&species!=='muhly'){ctx.strokeStyle='rgba(111,121,76,.28)';ctx.lineWidth=.35;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(l.x,l.y);ctx.stroke()}leaf(l)}
 for(const l of sim.leaves)if(!['attached','loosening','growing','gone'].includes(l.state))leaf(l);
 for(const p of sim.petals)petal(p);if(rainy)water.draw(ctx);ctx.restore();

 if(trail.length>1){ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(const p of trail)ctx.lineTo(p.x,p.y);ctx.strokeStyle=`rgba(135,151,113,${Math.max(0,.14*(1-trail[0].age/.45))})`;ctx.lineWidth=1;ctx.stroke()}ctx.restore();ctx=displayCtx;}treeWasActive=!!moving;if(moonlit)moon.shadow(ctx,plantCanvas,oy+745*scale,treeRevision);ctx.drawImage(plantCanvas,0,0,width,height);swipeHint.draw(ctx,ox,oy,scale,moonlit);if(moonlit)fireflies.draw(ctx,ox,oy,scale,false,sim.reduced);if(rainy)rain.foreground(ctx,sim.reduced);
}
function point(c,t){const u=1-t;return{x:u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y:u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]}}
function drawBranch(b){
 if(b.hidden)return;

 ctx.save();if(species==='willow'&&b.parent>=0)ctx.globalAlpha=b.depth===1?.55:.7;if(species==='jacaranda'&&b.parent>=0)ctx.globalAlpha=b.depth===1?.88:.78;ctx.translate(b.origin.x,b.origin.y);ctx.rotate(b.angle);
 if(!b.renderOutline){const sides=[[],[]];for(let i=0;i<=32;i++){const t=i/32,p=point(b.c,t),q=point(b.c,Math.min(1,t+.001)),r=point(b.c,Math.max(0,t-.001)),a=Math.atan2(q.y-r.y,q.x-r.x)+Math.PI/2;const radius=b.width*.5*Math.pow(1-t,.8)+.3;for(let side=0;side<2;side++){const sign=side?1:-1;sides[side].push({x:p.x+Math.cos(a)*radius*sign,y:p.y+Math.sin(a)*radius*sign})}}
 const outline=new Path2D();outline.moveTo(sides[0][0].x,sides[0][0].y);for(const p of sides[0].slice(1).concat(sides[1].reverse()))outline.lineTo(p.x,p.y);outline.closePath();b.renderOutline=outline;}const outline=b.renderOutline;
 const tone=ctx.createLinearGradient(-b.width,0,b.width,0);const bark=species==='willow'?(b.width<2?['#82934c','#b7c86d','#9dae59','#82934c']:['#686d59','#9c9e7a','#777d61','#686d59']):species==='ginkgo'?['#5c503c','#968368','#745f46','#64533f']:species==='jacaranda'?['#484541','#766b61','#5b544e','#443f3b']:species==='cherry'?['#715e5c','#a38e86','#8e7771','#705d59']:(rainy?['#626555','#8c8b75','#787b66','#656958']:['#716e58','#a19a7f','#8d876e','#77735f']);if(moonlit){bark[0]='#82949a';bark[1]=species==='jacaranda'?'#7d8581':bark[1]}tone.addColorStop(0,bark[0]);tone.addColorStop(.45,bark[1]);tone.addColorStop(.75,bark[2]);tone.addColorStop(1,bark[3]);ctx.fillStyle=tone;ctx.fill(outline);
 if(b.width>5){ctx.clip(outline);for(let i=0;i<9;i++){ctx.strokeStyle=i%2?'rgba(222,212,172,.3)':'rgba(78,77,61,.20)';ctx.lineWidth=.5+(i%3)*.4;ctx.beginPath();for(let j=0;j<16;j++){const t=j/15,p=point(b.c,t),x=p.x+Math.sin(j*.7+i)*2+(i-4)*b.width/10;j?ctx.lineTo(x,p.y):ctx.moveTo(x,p.y)}ctx.stroke()}}ctx.restore();
}
function drawCherryMesh(back){
 try{
  if(!willowMesh)willowMesh=new GrassMesh();const base=ctx.getTransform(),items=[];
  for(const l of sim.leaves){if((l.layer==='back')!==back||!['attached','loosening','growing'].includes(l.state))continue;
   const sun=!rainy&&!moonlit&&l.id%7===0&&l.x<650&&l.y<530;
   let image=(sun?cherrySun[l.sprite]:(cherryTones[l.sprite]&&cherryTones[l.sprite][l.tone]))||cherryImage;if(!image)continue;if(rainy)image=wetImage(image);if(moonlit)image=moon.leaf(image,l,species);
   const hit=rainy?water.hit(l):null,kick=hit?Math.sin(hit.age*25)*Math.exp(-hit.age*6):0,growth=l.state==='growing'&&!sim.reduced?l.growth*l.growth*(3-2*l.growth):1,w=l.size*(l.petal?.8:l.sprite===2?.75:1),h=w*image.height/image.width,k=leafScale*(back?.92:1)*growth,c=Math.cos(l.angle+kick*.065)*k,s=Math.sin(l.angle+kick*.065)*k,alpha=l.alpha*(back?.88:1);
   const points=[[-w*.5,-h*.85],[w*.5,-h*.85],[-w*.5,h*.15],[w*.5,h*.15]].map(([x,y])=>{const px=l.x+c*x-s*y,py=l.y+kick*3.2+s*x+c*y;return{x:base.a*px+base.c*py+base.e,y:base.b*px+base.d*py+base.f}});items.push({image,points,alpha});
   if(rainy){if(l.state==='attached'&&!back&&(l.id%4===0||hit)){const facing=Math.pow(Math.max(0,Math.cos(l.angle*.8+l.id*.71)),3),variation=sim.reduced?1:.85+.15*Math.sin(water.time*.6+l.id);items.push({image:wetSheen(image),points,alpha:alpha*(.09+facing*.23)*variation+(hit?Math.exp(-hit.age*12)*.19:0)})}water.anchor(l,image,w,h,leafScale*(back?.92:1),false)}
  }
  willowMesh.drawSprites(ctx,items,plantCanvas.width,plantCanvas.height);return true;
 }catch(e){willowMeshFailed=true;if(willowMesh)willowMesh.dispose();willowMesh=null;return false}
}
function drawWillowMesh(){
 try{
  if(!willowMesh)willowMesh=new GrassMesh();const base=ctx.getTransform(),items=[];
  for(const l of sim.leaves){if(!['attached','loosening','growing'].includes(l.state))continue;
   let image=(!rainy&&!moonlit&&l.id%7===0&&l.x<650&&l.y<530?willowSun:willowTones[l.tone])||willowImage;if(!image)continue;if(rainy)image=wetImage(image);if(moonlit)image=moon.leaf(image,l,species);
   const hit=rainy?water.hit(l):null,kick=hit?Math.sin(hit.age*25)*Math.exp(-hit.age*6):0,growth=l.state==='growing'&&!sim.reduced?l.growth*l.growth*(3-2*l.growth):1,w=l.size,h=w*image.height/image.width,k=leafScale*(l.layer==='back'?.92:1)*growth,c=Math.cos(l.angle+kick*.065)*k,s=Math.sin(l.angle+kick*.065)*k,alpha=l.alpha*(l.layer==='back'?.88:1);
   const points=[[-w*.34,-h*.1],[w*.34,-h*.1],[-w*.34,h*.9],[w*.34,h*.9]].map(([x,y])=>{const px=l.x+c*x-s*y,py=l.y+kick*3.2+s*x+c*y;return{x:base.a*px+base.c*py+base.e,y:base.b*px+base.d*py+base.f}});items.push({image,points,alpha});
   if(rainy){if(l.state==='attached'&&l.layer!=='back'&&(l.id%4===0||hit)){const facing=Math.pow(Math.max(0,Math.cos(l.angle*.8+l.id*.71)),3),variation=sim.reduced?1:.85+.15*Math.sin(water.time*.6+l.id);items.push({image:wetSheen(image),points,alpha:alpha*(.09+facing*.23)*variation+(hit?Math.exp(-hit.age*12)*.19:0)})}water.anchor(l,image,w,h,leafScale*(l.layer==='back'?.92:1),true)}
  }
  willowMesh.drawSprites(ctx,items,plantCanvas.width,plantCanvas.height);return true;
 }catch(e){willowMeshFailed=true;if(willowMesh)willowMesh.dispose();willowMesh=null;return false}
}
// Use one affine transform per narrow willow leaf instead of five canvas state calls.
function drawWillowLeaves(){
 const base=ctx.getTransform();ctx.save();
 for(const l of sim.leaves){if(!['attached','loosening','growing'].includes(l.state))continue;
  if(l.state==='growing'){ctx.setTransform(base.a,base.b,base.c,base.d,base.e,base.f);leaf(l);continue}
  let im=(!moonlit&&l.id%7===0&&l.x<650&&l.y<530?willowSun:willowTones[l.tone])||willowImage;if(!im)continue;if(moonlit)im=moon.leaf(im,l,species);
  const w=l.size,h=w*im.height/im.width,k=leafScale*(l.layer==='back'?.92:1),c=Math.cos(l.angle)*k,s=Math.sin(l.angle)*k;
  ctx.setTransform(base.a*c+base.c*s,base.b*c+base.d*s,-base.a*s+base.c*c,-base.b*s+base.d*c,base.a*l.x+base.c*l.y+base.e,base.b*l.x+base.d*l.y+base.f);
  ctx.globalAlpha=l.alpha*(l.layer==='back'?.88:1);ctx.drawImage(im,-w*.34,-h*.1,w*.68,h);
  if(moonlit&&width>600&&l.id%4===0)moon.glint(ctx,l,im,w,h,species);
 }
 ctx.restore();
}
function fallingTransform(l){
 if(species==='ginkgo'){const face=Math.cos(l.age*5.2+l.id*.37);ctx.scale(Math.sign(face)*Math.max(.12,Math.abs(face)),.78+.22*Math.abs(Math.sin(l.age*5.2+l.id*.37)));return}
 if(species==='jacaranda'){const face=Math.cos(l.age*6.3+l.id*.91);ctx.scale(Math.sign(face)*Math.max(.16,Math.abs(face)),.7+.22*Math.abs(Math.sin(l.age*4.1+l.id)));return}
 if(species==='willow'){ctx.scale(.2+.8*Math.abs(Math.cos(l.age*5.1+l.id*.37)),1);return}
 if(species==='cherry'){ctx.scale(.3+.7*Math.abs(Math.cos(l.age*4.2)),1);return}
 const phase=l.age*(2.1+(l.id%5)*.23)+l.id*.61,face=Math.cos(phase);
 ctx.transform(1,Math.sin(phase*.7)*.08,Math.sin(phase)*.12,1,0,0);
 ctx.scale((face>=0?1:-1)*Math.max(.18,Math.abs(face)),.78+.18*Math.abs(Math.sin(phase*.53)));
}
function leaf(l){const visualState=l.state;ctx.save();ctx.globalAlpha=l.alpha*(l.layer==='back'?(species==='ginkgo'?.82:species==='willow'?.88:species==='jacaranda'?.8:species==='cherry'?.88:.7):1);const hit=rainy?water.hit(l):null,hitAge=hit?hit.age:0,kick=hit?Math.sin(hitAge*25)*Math.exp(-hitAge*6):0;ctx.translate(l.x,l.y+kick*3.2);ctx.rotate(l.angle+kick*.065);ctx.scale(leafScale*(l.layer==='back'?.92:1),leafScale*(l.layer==='back'?.92:1));if(l.state==='growing'&&!sim.reduced){const g=l.growth*l.growth*(3-2*l.growth);ctx.scale(g,g)}if(l.state==='falling'&&!sim.reduced)fallingTransform(l);const sun=!rainy&&!moonlit&&l.id%7===0&&l.x<650&&l.y<530&&(species!=='maple'||l.tone!==4);let im=species==='jacaranda'?(['falling','grounded','fading'].includes(visualState)?jacarandaFlower:(l.id%9<3&&l.x<660&&l.y<620?jacarandaSun:jacarandaTones[l.tone]||jacarandaCluster)):species==='ginkgo'?(sun?ginkgoSun[l.sprite]:(ginkgoTones[l.sprite]&&ginkgoTones[l.sprite][l.tone]))||ginkgoImage:species==='willow'?(sun?willowSun:willowTones[l.tone]||willowImage):species==='cherry'?(l.petal&&l.state!=='attached'&&l.state!=='loosening'&&l.state!=='growing'?(petalVisible||petalImage||cherryImage):sun?cherrySun[visualState==='falling'?1:l.sprite]:((cherryTones[visualState==='falling'?1:l.sprite]&&cherryTones[visualState==='falling'?1:l.sprite][l.tone])||cherryImage)):(sun?mapleSun[l.sprite]:leafTones[l.sprite][l.tone]||sprites[l.sprite]);if(rainy)im=wetImage(im);if(moonlit)im=moon.leaf(im,l,species);if(im){const w=l.size*(species==='jacaranda'&&['falling','grounded','fading'].includes(visualState)?(.27+(l.id%5)*.025)*1.35:l.petal?.8:species==='cherry'?(visualState==='falling'?.72:l.sprite===2?.75:1):species==='ginkgo'?(visualState==='falling'||visualState==='grounded'||visualState==='fading'?.7:1)*(l.sprite===1?.78:l.sprite===2?.68:1):1),h=w*im.height/im.width;ctx.drawImage(im,-w*(species==='willow'?.34:.5),species==='willow'?-h*.1:species==='jacaranda'?-h*.5:-h*.85,species==='willow'?w*.68:w,h);if(moonlit&&width>600&&(species!=='willow'||l.id%4===0))moon.glint(ctx,l,im,w,h,species);if(rainy&&l.state==='attached'&&l.layer!=='back'&&(l.id%4===0||hit)){const alpha=ctx.globalAlpha;const facing=Math.pow(Math.max(0,Math.cos(l.angle*.8+l.id*.71)),3),variation=sim.reduced?1:.85+.15*Math.sin(water.time*.6+l.id);ctx.globalAlpha=alpha*(.09+facing*.23)*variation+(hit?Math.exp(-hitAge*12)*.19:0);ctx.drawImage(wetSheen(im),-w*(species==='willow'?.34:.5),species==='willow'?-h*.1:species==='jacaranda'?-h*.5:-h*.85,species==='willow'?w*.68:w,h);ctx.globalAlpha=alpha}if(rainy)water.anchor(l,im,w,h,leafScale*(l.layer==='back'?.92:1),species==='willow')}else{ctx.fillStyle=l.id%3?'#a5ad73':'#cfba72';ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-12,-8,-8,-18,0,-24);ctx.fill()}ctx.restore()}
function petal(p){if(!petalVisible&&!petalImage)return;ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(leafScale,leafScale);const im=petalVisible||petalImage,w=p.size,h=w*im.height/im.width;ctx.drawImage(im,-w*.5,-h*.5,w,h);ctx.restore()}
for(const button of document.querySelectorAll('.species-picker button'))button.addEventListener('click',()=>{if(button.dataset.species===species)return;finish();species=button.dataset.species;document.querySelector('main').dataset.species=species;if(willowMesh){willowMesh.dispose();willowMesh=null}if(sim.dispose)sim.dispose();sim=makeSimulation(species);moon.reset();sim.setReduced(media.matches);for(const b of document.querySelectorAll('.species-picker button'))b.setAttribute('aria-pressed',String(b===button));pulse=0;trail=[];last=null;acc=0;resize()});
document.querySelector('#breeze').addEventListener('click',()=>{sim.beginGesture();if(isGrass())sim.breeze();else pulse=1;audio.stir(.55);wake()});
const soundButton=document.querySelector('#sound');soundButton.setAttribute('aria-pressed',String(audio.enabled));soundButton.setAttribute('aria-label',audio.enabled?'关闭声音':'开启声音');soundButton.addEventListener('click',()=>{const on=audio.setEnabled(!audio.enabled);soundButton.setAttribute('aria-pressed',String(on));soundButton.setAttribute('aria-label',on?'关闭声音':'开启声音')});
document.addEventListener('pointerdown',e=>{swipeHint.dismiss();if(!e.target.closest('#sound'))audio.activate()},{capture:true});document.addEventListener('keydown',()=>{swipeHint.dismiss();audio.activate()},{capture:true});
 document.querySelector('#reset').addEventListener('click',()=>{finish();treeDirty=true;sim.reset();rain.reset();water.reset();moon.reset();fireflies.reset();sim.setReduced(media.matches);pulse=0;trail=[];last=null;acc=0;wake()});
 const onMotionChange=e=>{treeDirty=true;if(e.matches)swipeHint.dismiss();sim.setReduced(e.matches);trail=[];wake()};if(media.addEventListener)media.addEventListener('change',onMotionChange);else if(media.addListener)media.addListener(onMotionChange);
 let moonDrift=0;function drift(){if(document.hidden||(moonlit&&++moonDrift%6!==0))return;let shed=false;for(let i=0;i<(species==='cherry'?2:1);i++)shed=sim.shedAmbient()||shed;if(shed)wake()}
 setInterval(drift,2200);
 function flurry(){if(document.hidden||sim.reduced||moonlit)return;for(let i=0;i<(species==='willow'?3:9);i++)setTimeout(drift,i*170)}
 setTimeout(()=>{flurry();setInterval(flurry,20000)},4800);
 document.addEventListener('visibilitychange',()=>{audio.visibility(document.hidden);if(document.hidden){swipeHint.dismiss();finish();cancelAnimationFrame(raf);raf=0;last=null;acc=0;sim.wind=[];pulse=0;trail=[]}else wake()});if(typeof ResizeObserver==='function')new ResizeObserver(resize).observe(canvas);else window.addEventListener('resize',resize);resize();

const sceneButtons=Array.from(document.querySelectorAll('#weather button'));
const sceneOrder=['day','rain','moon'];
function setScene(scene){finish();rainy=scene==='rain';moonlit=scene==='moon';const chromeColor=scene==='moon'?'#405d7a':scene==='rain'?'#8d9f9e':'#c4d6d5';document.querySelector('meta[name="theme-color"]').setAttribute('content',chromeColor);document.documentElement.style.backgroundColor=chromeColor;audio.setWeather(scene);water.reset();moon.reset();document.querySelector('main').dataset.scene=scene;for(const button of sceneButtons)button.setAttribute('aria-pressed',String(button.dataset.scene===scene));last=null;acc=0;resize()}
let sceneAnimationTimer=0;
function animateSceneIcon(button){clearTimeout(sceneAnimationTimer);for(const item of sceneButtons)item.classList.remove('scene-animate');if(media.matches)return;void button.offsetWidth;button.classList.add('scene-animate');sceneAnimationTimer=setTimeout(()=>button.classList.remove('scene-animate'),760)}
for(const button of sceneButtons)button.addEventListener('click',()=>{if(button.getAttribute('aria-pressed')!=='true')setScene(button.dataset.scene);animateSceneIcon(button)});
const requestedScene=new URLSearchParams(location.search).get('scene');setScene(sceneOrder.includes(requestedScene)?requestedScene:'day');

if(new URLSearchParams(location.search).get('plant')==='needle')document.querySelector('button[data-species=needle]').click();

setTimeout(()=>{if(!document.hidden&&swipeHint.start(sim,sim.reduced))wake()},1500);

// Hide only the controls; simulation, canvas input and audio continue unchanged.
const immersiveButton=document.querySelector('#immersive');
const quietControls=Array.from(document.querySelectorAll('#weather,.species-picker,#tools'));
function setImmersive(active){
 document.querySelector('main').classList.toggle('is-immersive',active);
 for(const control of quietControls)control.inert=active;
 immersiveButton.setAttribute('aria-pressed',String(active));
 const label=active?'显示界面':'隐藏界面';immersiveButton.setAttribute('aria-label',label);immersiveButton.title=label;
 if(active){closeTools(false);swipeHint.dismiss()}
}
immersiveButton.addEventListener('click',()=>setImmersive(immersiveButton.getAttribute('aria-pressed')!=='true'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&immersiveButton.getAttribute('aria-pressed')==='true'){setImmersive(false);immersiveButton.focus({preventScroll:true})}});

const tools=document.querySelector('#tools'),toolsToggle=document.querySelector('#tools-toggle'),toolActions=document.querySelector('#tool-actions');
function closeTools(returnFocus){
 toolsToggle.setAttribute('aria-expanded','false');toolsToggle.setAttribute('aria-label','展开工具');toolsToggle.title='展开工具';
 toolActions.inert=true;toolActions.setAttribute('aria-hidden','true');tools.classList.remove('is-open');
 if(returnFocus)toolsToggle.focus({preventScroll:true});
}
toolsToggle.addEventListener('click',()=>{
 if(toolsToggle.getAttribute('aria-expanded')==='true'){closeTools(false);return}
 toolsToggle.setAttribute('aria-expanded','true');toolsToggle.setAttribute('aria-label','收起工具');toolsToggle.title='收起工具';
 toolActions.inert=false;toolActions.setAttribute('aria-hidden','false');tools.classList.add('is-open');
});
toolActions.addEventListener('click',e=>{if(e.target.closest('button'))closeTools(true)});
document.addEventListener('pointerdown',e=>{if(!tools.contains(e.target))closeTools(false)});
document.addEventListener('focusin',e=>{if(!tools.contains(e.target))closeTools(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toolsToggle.getAttribute('aria-expanded')==='true'){closeTools(true);e.preventDefault()}});

})().catch(function(error){console.error(error)});
