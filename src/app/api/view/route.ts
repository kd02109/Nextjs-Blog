import { supabase } from '@/util/supabase';
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.query);
  const { slug } = req.query;
  if (process.env.NODE_ENV === 'development') {
    return res
      .status(200)
      .json({ message: 'View count not incremented in development.' });
  }

  const { data: existing, error: fetchError } = await supabase
    .from('views')
    .select('view_count')
    .eq('slug', slug as string)
    .single();

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message });
  }

  const currentViewCount = existing.view_count ? existing.view_count : 0;
  const newViewCount = currentViewCount + 1;
  const { data, error } = await supabase
    .from('views')
    .upsert(
      { slug: slug as string, view_count: newViewCount },
      { onConflict: 'slug' },
    )
    .select('view_count')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json({ message: 'ok' });
}
