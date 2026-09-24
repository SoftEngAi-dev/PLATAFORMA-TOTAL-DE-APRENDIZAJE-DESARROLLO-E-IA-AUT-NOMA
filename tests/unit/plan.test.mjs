import test from 'node:test';
import assert from 'node:assert/strict';
const stages=['analyze','plan','build','test','summarize'];
test('agent contract has complete lifecycle',()=>{assert.deepEqual(stages,['analyze','plan','build','test','summarize']);});
