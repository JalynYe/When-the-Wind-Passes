// Entirely synthesized PCM: no recordings, audio downloads, or embedded audio files.
// One second per beat (60 BPM); all pitched layers share C/E/G.
const MUSIC_BEAT=1;
export function makeMusicBuffer(context,weather='day'){
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
export function makeRainBuffer(context){
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
export function makeBranchBuffer(context,midi){const rate=context.sampleRate,length=Math.round(rate*3.2),buffer=context.createBuffer(1,length,rate),d=buffer.getChannelData(0),f=440*Math.pow(2,(midi-69)/12);for(let i=0;i<length;i++){const t=i/rate,phase=6.2831853*f*t,env=(1-Math.exp(-t/.032))*Math.exp(-t*2.35)*Math.min(1,(3.2-t)*3),v=(Math.sin(phase)*.96+Math.sin(phase*2)*.035*Math.exp(-t*4)+Math.sin(phase*3)*.005*Math.exp(-t*6))*env*.11;d[i]+=v;for(const [delay,amount] of [[MUSIC_BEAT*.5,.065],[MUSIC_BEAT,.022]]){const j=i+Math.round(delay*rate);if(j<length)d[j]+=v*amount}}return buffer}
export class WindAudio {
 constructor(){try{this.enabled=localStorage.getItem('tree-sound-off')!=='1'}catch{this.enabled=true}this.context=null;this.weather='day';this.hidden=false;this.noteBuffers=new Map();this.voices=[];this.nextNote=0;this.phraseIndex=0;this.lastNote=-Infinity}
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
 setEnabled(on){this.enabled=on;try{localStorage.setItem('tree-sound-off',on?'0':'1')}catch{}if(on)this.activate();else if(this.context)this.context.suspend().catch(()=>{});return this.enabled}
 visibility(hidden){this.hidden=hidden;if(!this.context)return;if(hidden||!this.enabled)this.context.suspend().catch(()=>{});else this.context.resume().catch(()=>{})}
}
