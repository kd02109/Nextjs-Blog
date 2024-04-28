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
      { slug: slug as string, view_count: count ? 1 + Number(count) : 0 },
      { onConflict: 'slug' },
    )
    .select('view_count')
    .single();

  if (error) {
    return new Response(JSON.stringify({ message: 'get data fail' }), {
      status: 500,
    });
  }

  if (data) {
    const { data, error } = await supabase.rpc('increment', {
      slug: slug as string,
    });

    if (error) {
      console.log(error);
      return new Response(
        JSON.stringify({ message: 'update view_count fail' }),
        { status: 500 },
      );
    }
  }
  return new Response(JSON.stringify({ message: 'ok' }), { status: 200 });
}
