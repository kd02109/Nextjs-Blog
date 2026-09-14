import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeImgSize from 'rehype-img-size';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { defineCollection, defineConfig, s } from 'velite';
import type { MdxOptions } from 'velite';

const posts = defineCollection({
  name: 'Post',
  pattern: '**/*.mdx',
  schema: s.object({
    title: s.string(),
    date: s.isodate(),
    id: s.string(),
    tag: s.array(s.string()),
    brand: s.string(),
    description: s.string().optional(),
    image: s.string().optional(),
    carousel: s.boolean().optional(),
    sourcePath: s.path(),
    url: s
      .path()
      .transform(path =>
        path.startsWith('project/') ? path.slice('project/'.length) : path,
      ),
    raw: s.raw(),
    code: s.mdx(),
  }),
});

const rehypePlugins = [
  rehypeSlug,
  [rehypePrettyCode, { theme: 'github-dark' }],
  [
    rehypeAutolinkHeadings,
    {
      properties: {
        className: ['anchor'],
        ariaLabel: 'anchor',
      },
    },
  ],
  [rehypeImgSize, { dir: 'public' }],
] as unknown as NonNullable<MdxOptions['rehypePlugins']>;

export default defineConfig({
  root: 'posts',
  strict: true,
  output: {
    data: '.velite',
    clean: true,
    format: 'cjs',
  },
  collections: { posts },
  mdx: {
    gfm: true,
    copyLinkedFiles: false,
    remarkPlugins: [],
    rehypePlugins,
  },
});
