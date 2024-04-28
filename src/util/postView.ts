import geturl from '@/util/url';

export default async function postView(slug: string | undefined) {
  if (!slug) return 'not slug';
  const url = geturl();

  const res = await fetch(`${url}/api/view?slug=${slug}`, {
    method: 'post',
    cache: 'no-store',
  });

  return res.json();
}
