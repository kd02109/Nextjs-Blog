import { getAllPosts } from '@/lib/content';
import { incrementView } from '@/server/supabase';
import { NextResponse } from 'next/server';

const MAX_SLUG_LENGTH = 120;
const SLUG_PATTERN = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
const knownViewSlugs = new Set(
  getAllPosts().map(post => post.url.split('/').at(-1)),
);

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  if (slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { message: 'Invalid view slug.' },
      { status: 400 },
    );
  }

  if (!knownViewSlugs.has(slug)) {
    return NextResponse.json(
      { message: 'Content not found.' },
      { status: 404 },
    );
  }

  try {
    const viewCount = await incrementView(slug);
    return NextResponse.json({ viewCount });
  } catch {
    return NextResponse.json(
      { message: 'Unable to record view.' },
      { status: 500 },
    );
  }
}
