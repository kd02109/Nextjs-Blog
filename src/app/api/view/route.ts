import { supabase } from '@/util/supabase';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  const { url } = req;
  const urlObj = new URL(url);
  const searchParams = new URLSearchParams(urlObj.search);

  const slug = searchParams.get('slug');
  const count = searchParams.get('count');

  /*   if (process.env.NODE_ENV === 'development') {
    return new Response(
      JSON.stringify({ message: 'View count not incremented in development.' }),
      { status: 200 },
    );
  } */

  const { data, error } = await supabase
    .from('views')
    .upsert(
      { slug: slug as string, view_count: count ? 1 + Number(count) : 1 },
      { onConflict: 'slug' },
    )
    .select('view_count')
    .single();

  if (error) {
    return new Response(JSON.stringify({ message: 'fail' }), { status: 500 });
  }
  return new Response(JSON.stringify({ message: 'ok' }), { status: 200 });
}
