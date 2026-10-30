import test from 'node:test';
import assert from 'node:assert/strict';
import {CanopySurface} from '../dist/grass-canopy.js';
function run(hz){const s=new CanopySurface();s.resize(390,844);let peak=0;for(let i=0;i<hz;i++){s.drag({sx:180+i*16/hz,sy:420},{sx:180+(i+1)*16/hz,sy:420});for(let j=0;j<120/hz;j++)s.step(1/120,false);peak=Math.max(peak,...s.nodes.map(n=>Math.abs(n.x)))}return {s,peak}}
test('canopy displacement is local, bounded and stable across input rates',()=>{const runs=[30,60,120].map(run),peaks=runs.map(r=>r.peak);assert.ok(Math.min(...peaks)>.2);assert.ok(Math.max(...peaks)/Math.min(...peaks)<1.1);const {s}=runs[0];assert.ok(s.nodes.every(n=>!n.edge||(n.x===0&&n.y===0)));assert.ok(s.nodes.some(n=>n.x===0&&n.y===0));for(let i=0;i<1200;i++)s.step(1/60,false);assert.equal(s.active,false);assert.ok(s.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)))});
test('reduced motion clears the canopy displacement and gusts',()=>{const {s}=run(60);s.breeze();s.setReduced();assert.equal(s.active,false);assert.ok(s.nodes.every(n=>n.x===0&&n.y===0))});
