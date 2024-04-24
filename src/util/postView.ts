export default async function postView(slug: string | undefined) {
  if (!slug) return 'not slug';

  const res = await fetch(`/api/view?slug=${slug}`, {
    method: 'post',
  });
  return await res.json();
}
