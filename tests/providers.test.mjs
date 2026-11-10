import test from 'node:test';import assert from 'node:assert/strict';import {stale} from '../scripts/check-providers.mjs';
const now=new Date('2026-12-10T00:00:00');
test('never verified is stale',()=>assert.equal(stale([{name:'A',verified:null}],35,now)[0].verified,null));
test('fresh passes, old flagged',()=>{const s=stale([{name:'A',verified:'2026-12-01'},{name:'B',verified:'2026-10-01'}],35,now);assert.deepEqual(s.map(x=>x.name),['B']);assert.equal(s[0].ageDays,70)});
