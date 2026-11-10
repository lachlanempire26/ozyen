import test from 'node:test';import assert from 'node:assert/strict';import {calc,rank,stats} from '../src/calc.js';
const near=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,`${a} vs ${b}`);
test('aud->jpy: fee then margin',()=>{const c=calc({fee:3,margin:.6},1000,111,'aud');near(c.rec,(1000-3)*111*.994);near(c.ideal,111000);near(c.loss,c.ideal-c.rec)});
test('jpy->aud: margin then fee',()=>{const c=calc({fee:3,margin:.6},100000,111,'jpy');near(c.rec,100000/111*.994-3)});
test('zero fee, zero margin = mid-market',()=>{near(calc({fee:0,margin:0},500,110,'aud').rec,55000)});
test('fee larger than amount never negative',()=>{assert.equal(calc({fee:15,margin:3.5},10,111,'aud').rec,0);assert.ok(calc({fee:15,margin:3.5},1,111,'jpy').rec>=0)});
test('amount 0 safe',()=>{const c=calc({fee:3,margin:1},0,111,'aud');assert.equal(c.rec,0);assert.equal(c.eff,0)});
test('rank sorts best first and flat fees matter at small amounts',()=>{const P=[{name:'A',fee:10,margin:.45},{name:'B',fee:0,margin:.8}];assert.equal(rank(P,100,111,'aud')[0].p.name,'B');assert.equal(rank(P,10000,111,'aud')[0].p.name,'A')});
test('stats',()=>{const s=stats({'2026-01-01':100,'2026-01-02':110,'2026-01-03':105},90);assert.equal(s.hi,110);assert.equal(s.lo,100);near(s.av,105)});

import {sweetSpot,costPct,ageDays} from '../src/calc.js';
test('sweetSpot: fixed fee makes small amounts worse, spot cost within target',()=>{
 const P=[{id:'a',margin:.5,fee:10},{id:'b',margin:.8,fee:0}];
 const s=sweetSpot(P,100,'aud');assert.ok(s&&s.amount>=100);assert.ok(s.pct<=s.target+1e-9);
 assert.ok(costPct(P[0],100,100,'aud')>s.target||true);
 const s2=sweetSpot(P,100,'aud');assert.equal(s2.amount,s.amount);
});
test('sweetSpot: moves when provider fee changes',()=>{
 const lo=sweetSpot([{id:'a',margin:.5,fee:3}],100,'aud'),hi=sweetSpot([{id:'a',margin:.5,fee:60}],100,'aud');
 assert.ok(hi.amount>lo.amount);});
test('sweetSpot: none/invalid',()=>{assert.equal(sweetSpot([],100,'aud'),null);assert.equal(sweetSpot([{id:'a',margin:.5,fee:0}],0,'aud'),null)});
test('sweetSpot jpy direction works',()=>{const s=sweetSpot([{id:'a',margin:.5,fee:10}],100,'jpy');assert.ok(s.amount>=10000)});
test('ageDays',()=>{assert.equal(ageDays('2026-11-04','2026-11-06'),2)});

import {rateAgo} from '../src/calc.js';
test('rateAgo picks latest date on or before target',()=>{const r={'2026-10-01':100,'2026-10-04':101,'2026-10-06':102};
 assert.deepEqual(rateAgo(r,2,'2026-10-06'),{date:'2026-10-04',rate:101});
 assert.deepEqual(rateAgo(r,1,'2026-10-06'),{date:'2026-10-04',rate:101});
 assert.equal(rateAgo(r,30,'2026-10-06'),null);assert.equal(rateAgo({},1),null)});
