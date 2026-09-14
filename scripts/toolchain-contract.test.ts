import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type ValidateToolchain = (runtime: {
  nodeVersion: string;
  npmUserAgent: string | undefined;
}) => void;

const loadValidator = async (): Promise<ValidateToolchain | undefined> => {
  try {
    const modulePath = './verify-toolchain.mjs';
    const verifier = (await import(/* @vite-ignore */ modulePath)) as {
      validateToolchain?: ValidateToolchain;
    };
    return verifier.validateToolchain;
  } catch {
    return undefined;
  }
};

describe('local and CI toolchain contract', () => {
  it('pins npm, Node types, and the Supabase CLI to the approved releases', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      packageManager?: string;
      devDependencies?: Record<string, string>;
    };
    const packageLock = JSON.parse(
      readFileSync('package-lock.json', 'utf8'),
    ) as {
      packages?: Record<
        string,
        { version?: string; devDependencies?: Record<string, string> }
      >;
    };

    expect(packageJson.packageManager).toBe('npm@11.12.1');
    expect(packageJson.devDependencies?.['@types/node']).toBe('24.13.4');
    expect(packageJson.devDependencies?.supabase).toBe('2.117.0');
    expect(packageLock.packages?.['']?.devDependencies?.['@types/node']).toBe(
      '24.13.4',
    );
    expect(packageLock.packages?.['']?.devDependencies?.supabase).toBe(
      '2.117.0',
    );
    expect(packageLock.packages?.['node_modules/@types/node']?.version).toBe(
      '24.13.4',
    );
    expect(packageLock.packages?.['node_modules/supabase']?.version).toBe(
      '2.117.0',
    );
  });

  it('accepts Node 24 with the pinned npm release', async () => {
    const validateToolchain = await loadValidator();
    expect(validateToolchain).toBeTypeOf('function');

    expect(() =>
      validateToolchain!({
        nodeVersion: 'v24.15.0',
        npmUserAgent: 'npm/11.12.1 node/v24.15.0 darwin arm64 workspaces/false',
      }),
    ).not.toThrow();
  });

  it.each([
    ['a different Node major', 'v26.0.0', 'npm/11.12.1 node/v26.0.0'],
    ['a different npm release', 'v24.15.0', 'npm/11.13.0 node/v24.15.0'],
    ['an invocation outside npm', 'v24.15.0', undefined],
  ])('rejects %s', async (_description, nodeVersion, npmUserAgent) => {
    const validateToolchain = await loadValidator();
    expect(validateToolchain).toBeTypeOf('function');

    expect(() => validateToolchain!({ nodeVersion, npmUserAgent })).toThrow(
      /Node\.js 24.*npm 11\.12\.1/,
    );
  });
});
