export default async function postView(slug: string | undefined) {
  if (!slug) return 'not slug';
  let url = process.env.NEXT_PUBLIC_URL;

  if (process.env.NODE_ENV === 'development') {
    url = process.env.NEXT_DEV_URL;
  }

  const res = await fetch(`${url}/api/view?slug=${slug}`, {
    method: 'post',
    cache: 'no-store',
  });

  return res.json();
}
