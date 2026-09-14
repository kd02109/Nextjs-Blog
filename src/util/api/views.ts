export async function requestViewIncrement(slug: string): Promise<number> {
  const response = await fetch(`/api/views/${encodeURIComponent(slug)}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Unable to record view.');
  }

  const body: unknown = await response.json();

  if (
    typeof body !== 'object' ||
    body === null ||
    !('viewCount' in body) ||
    typeof body.viewCount !== 'number'
  ) {
    throw new Error('Unable to record view.');
  }

  return body.viewCount;
}
