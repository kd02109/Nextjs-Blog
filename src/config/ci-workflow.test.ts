import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');

describe('CI workflow supply-chain contract', () => {
  it('pins every third-party action to a full commit with a readable version comment', () => {
    const actionReferences = [...workflow.matchAll(/^\s*uses:\s*(.+)$/gm)].map(
      match => match[1].trim(),
    );

    expect(actionReferences).toHaveLength(6);
    for (const reference of actionReferences) {
      expect(reference).toMatch(
        /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+@[0-9a-f]{40}\s+#\sv\S+$/,
      );
    }
  });
});
