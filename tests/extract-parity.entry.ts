/**
 * /api/extract parity: replays the synthetic upstream scenarios against the
 * shipped route and compares status, headers and body bytes with the golden
 * recorded from the pre-refactor route (tests/fixtures/extract/golden.json).
 *
 * RECORD_GOLDEN=1 rewrites the golden instead of comparing.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { POST } from '../src/pages/api/extract';
import { SCENARIOS, makeFetch } from './fixtures/extract/scenarios';

const GOLDEN = path.join(process.cwd(), 'tests/fixtures/extract/golden.json');
const RECORD = process.env.RECORD_GOLDEN === '1';

interface Recorded {
  status: number;
  headers: [string, string][];
  bodyText: string;
}

async function run(scenario: (typeof SCENARIOS)[number]): Promise<Recorded> {
  const stub = makeFetch(scenario.route);
  const realFetch = globalThis.fetch;
  globalThis.fetch = stub.fetch as typeof fetch;
  const realConsole = { warn: console.warn, error: console.error };
  console.warn = () => {};
  console.error = () => {};
  try {
    const request = new Request('https://pintdownload.app/api/extract', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(scenario.headers ?? {}) },
      body: scenario.body,
    });
    const response = await (POST as any)({ request });
    const headers = [...response.headers.entries()].sort(([a], [b]) => a.localeCompare(b)) as [string, string][];
    return { status: response.status, headers, bodyText: await response.text() };
  } finally {
    globalThis.fetch = realFetch;
    console.warn = realConsole.warn;
    console.error = realConsole.error;
  }
}

if (RECORD) {
  describe('record golden', () => {
    it('writes tests/fixtures/extract/golden.json', async () => {
      const out: Record<string, Recorded> = {};
      for (const s of SCENARIOS) out[s.name] = await run(s);
      fs.writeFileSync(GOLDEN, `${JSON.stringify(out, null, 2)}\n`);
    });
  });
} else {
  const golden: Record<string, Recorded> = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
  describe('/api/extract parity with pre-refactor golden', () => {
    it('golden covers every scenario', () => {
      assert.deepEqual(Object.keys(golden).sort(), SCENARIOS.map((s) => s.name).sort());
    });
    for (const s of SCENARIOS) {
      it(s.name, async () => {
        const got = await run(s);
        const want = golden[s.name];
        assert.equal(got.status, want.status, 'status');
        assert.deepEqual(got.headers, want.headers, 'headers');
        assert.ok(got.bodyText === want.bodyText, `body bytes differ:\n got: ${got.bodyText}\nwant: ${want.bodyText}`);
      });
    }
  });
}
