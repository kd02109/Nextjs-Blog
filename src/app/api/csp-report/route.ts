import 'server-only';

import { z } from 'zod';

const MAX_REPORT_BYTES = 16 * 1024;
const MAX_REPORTS_PER_BATCH = 10;
const reportUrl = z.string().max(2048);
const reportNumber = z.number().int().nonnegative().max(1_000_000_000);
const reportDirective = z.string().trim().min(1).max(128);

const legacyReportSchema = z.object({
  'csp-report': z.object({
    'document-uri': reportUrl,
    'blocked-uri': reportUrl,
    'effective-directive': reportDirective,
    'violated-directive': reportDirective.optional(),
    disposition: z.enum(['enforce', 'report']).optional(),
    'source-file': reportUrl.optional(),
    'status-code': reportNumber.optional(),
    'line-number': reportNumber.optional(),
    'column-number': reportNumber.optional(),
  }),
});

const reportingApiReportSchema = z
  .array(
    z.object({
      type: z.literal('csp-violation'),
      body: z.object({
        documentURL: reportUrl,
        blockedURL: reportUrl,
        effectiveDirective: reportDirective,
        violatedDirective: reportDirective.optional(),
        disposition: z.enum(['enforce', 'report']).optional(),
        sourceFile: reportUrl.optional(),
        statusCode: reportNumber.optional(),
        lineNumber: reportNumber.optional(),
        columnNumber: reportNumber.optional(),
      }),
    }),
  )
  .min(1)
  .max(MAX_REPORTS_PER_BATCH);

type SanitizedReport = {
  type: 'csp-violation';
  documentUrl?: string;
  blockedUrl?: string;
  sourceFile?: string;
  effectiveDirective?: string;
  violatedDirective?: string;
  disposition?: 'enforce' | 'report';
  statusCode?: number;
  lineNumber?: number;
  columnNumber?: number;
};

class ReportTooLargeError extends Error {}

function invalidReport(status: 400 | 413 | 415) {
  return Response.json({ message: 'Invalid CSP report.' }, { status });
}

function sanitizeUrl(value: string | undefined) {
  if (value === undefined) return undefined;

  const normalized = value.trim();
  if (/^(?:inline|eval|self)$/i.test(normalized)) {
    return normalized.toLowerCase();
  }
  if (/^(?:blob|data):/i.test(normalized)) {
    return normalized.slice(0, normalized.indexOf(':')).toLowerCase();
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return undefined;
    }

    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return undefined;
  }
}

function sanitizeDirective(value: string | undefined) {
  if (value === undefined) return undefined;

  const normalized = value.trim().toLowerCase();
  return /^[a-z][a-z0-9-]{0,63}$/.test(normalized) ? normalized : undefined;
}

function compactReport(report: SanitizedReport): SanitizedReport {
  return Object.fromEntries(
    Object.entries(report).filter(([, value]) => value !== undefined),
  ) as SanitizedReport;
}

function sanitizeLegacyReport(
  report: z.infer<typeof legacyReportSchema>['csp-report'],
) {
  return compactReport({
    type: 'csp-violation',
    documentUrl: sanitizeUrl(report['document-uri']),
    blockedUrl: sanitizeUrl(report['blocked-uri']),
    sourceFile: sanitizeUrl(report['source-file']),
    effectiveDirective: sanitizeDirective(report['effective-directive']),
    violatedDirective: sanitizeDirective(report['violated-directive']),
    disposition: report.disposition,
    statusCode: report['status-code'],
    lineNumber: report['line-number'],
    columnNumber: report['column-number'],
  });
}

function sanitizeReportingApiReport(
  report: z.infer<typeof reportingApiReportSchema>[number],
) {
  return compactReport({
    type: 'csp-violation',
    documentUrl: sanitizeUrl(report.body.documentURL),
    blockedUrl: sanitizeUrl(report.body.blockedURL),
    sourceFile: sanitizeUrl(report.body.sourceFile),
    effectiveDirective: sanitizeDirective(report.body.effectiveDirective),
    violatedDirective: sanitizeDirective(report.body.violatedDirective),
    disposition: report.body.disposition,
    statusCode: report.body.statusCode,
    lineNumber: report.body.lineNumber,
    columnNumber: report.body.columnNumber,
  });
}

async function readReportBody(request: Request) {
  const declaredLength = request.headers.get('content-length');
  if (declaredLength !== null) {
    if (!/^\d+$/.test(declaredLength)) {
      throw new TypeError('Invalid content length.');
    }
    if (Number(declaredLength) > MAX_REPORT_BYTES) {
      throw new ReportTooLargeError();
    }
  }

  const reader = request.body?.getReader();
  if (!reader) return '';

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    receivedBytes += value.byteLength;
    if (receivedBytes > MAX_REPORT_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new ReportTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder('utf-8', { fatal: true }).decode(body);
}

export async function POST(request: Request) {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase();

  if (
    contentType !== 'application/csp-report' &&
    contentType !== 'application/reports+json'
  ) {
    return invalidReport(415);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(await readReportBody(request));
  } catch (error) {
    return invalidReport(error instanceof ReportTooLargeError ? 413 : 400);
  }

  const reports: SanitizedReport[] = [];
  if (contentType === 'application/csp-report') {
    const result = legacyReportSchema.safeParse(payload);
    if (!result.success) return invalidReport(400);
    reports.push(sanitizeLegacyReport(result.data['csp-report']));
  } else {
    const result = reportingApiReportSchema.safeParse(payload);
    if (!result.success) return invalidReport(400);
    reports.push(...result.data.map(sanitizeReportingApiReport));
  }

  for (const report of reports) {
    console.info('csp-report', report);
  }

  return new Response(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  });
}
