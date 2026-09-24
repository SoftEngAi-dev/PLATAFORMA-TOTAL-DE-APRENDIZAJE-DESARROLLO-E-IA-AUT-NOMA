import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeName, safeRelativePath } from '../../services/test-utils/policy.mjs';

test('rejects workspace traversal',()=>{assert.throws(()=>safeRelativePath('../secret.txt'),/Traversal/);assert.equal(safeRelativePath('src/index.ts'),'src/index.ts');});
test('normalizes project names safely',()=>{assert.equal(sanitizeName('  Mi Proyecto  '),'Mi Proyecto');assert.throws(()=>sanitizeName('../escape'),/Nombre/);});
