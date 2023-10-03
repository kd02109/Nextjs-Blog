import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import highlight from 'rehype-highlight';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import rehypeImgSize from 'rehype-img-size';

const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the post',
      required: true,
    },
    date: {
      type: 'date',
      description: 'The date of the post',
      required: true,
    },
    id: {
      type: 'string',
      description: 'the id of the post',
      required: true,
    },
    tag: {
      type: 'list',
      description: 'the tags of the post',
      required: true,
      of: { type: 'string' },
    },
    brand: {
      type: 'string',
      description: 'the type of text',
      required: true,
    },
    description: {
      type: 'string',
      description: 'description about each mdx',
      required: false,
    },
    carousel: {
      type: 'string',
      description: '글의 케러셀 포함 여부를 결정',
      required: false,
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: doc => {
        if (doc._raw.flattenedPath.includes('project')) {
          return `${doc._raw.flattenedPath.replace('project/', '')}`;
        }
        return `${doc._raw.flattenedPath}`;
      },
    },
  },
}));

export default makeSource({
  contentDirPath: 'posts',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: 'github-dark', // 코드작성시 적용할 테마
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['anchor'],
            ariaLabel: 'anchor',
          },
        },
      ],
      highlight,
      // @ts-ignore
      [rehypeImgSize, { dir: 'public' }],
    ],
  },
});
