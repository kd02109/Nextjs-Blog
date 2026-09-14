import path from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const lintRestrictedImports = async (source: string, filePath: string) => {
  const eslint = new ESLint({ cwd: path.resolve(process.cwd()) });
  const [result] = await eslint.lintText(source, { filePath });

  return result.messages
    .filter(message => message.ruleId === 'no-restricted-imports')
    .map(message => message.message);
};

describe('repository import boundaries', () => {
  it('rejects generated content imports outside the content facade', async () => {
    const messages = await lintRestrictedImports(
      "import posts from '../../../.velite/posts.json';\nvoid posts;\n",
      'src/components/content-boundary-probe.ts',
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('src/lib/content.ts');
  });

  it('rejects Supabase client imports outside the two approved modules', async () => {
    const messages = await lintRestrictedImports(
      "import { createClient } from '@supabase/supabase-js';\nvoid createClient;\n",
      'src/components/supabase-boundary-probe.ts',
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('src/lib/supabase/browser.ts');
    expect(messages[0]).toContain('src/server/supabase.ts');
  });

  it.each([
    {
      filePath: 'src/lib/content.ts',
      source: "import posts from '../../.velite/posts.json';\nvoid posts;\n",
    },
    {
      filePath: 'src/lib/supabase/browser.ts',
      source:
        "import { createClient } from '@supabase/supabase-js';\nvoid createClient;\n",
    },
    {
      filePath: 'src/server/supabase.ts',
      source:
        "import { createClient } from '@supabase/supabase-js';\nvoid createClient;\n",
    },
  ])(
    'allows the approved facade import in $filePath',
    async ({ source, filePath }) => {
      expect(await lintRestrictedImports(source, filePath)).toEqual([]);
    },
  );
});
