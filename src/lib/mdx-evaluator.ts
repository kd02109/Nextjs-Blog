import 'server-only';

import type { ComponentType } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';

export type EvaluatedMdxComponent<TComponents = Record<string, unknown>> =
  ComponentType<{ components?: TComponents }>;

export const evaluateMdx = <TComponents = Record<string, unknown>>(
  code: string,
): EvaluatedMdxComponent<TComponents> => {
  const evaluate = new Function(code) as (runtime: typeof jsxRuntime) => {
    default: EvaluatedMdxComponent<TComponents>;
  };

  return evaluate({ ...jsxRuntime }).default;
};
