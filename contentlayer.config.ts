import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import highlight from 'rehype-highlight';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';

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
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: doc => `/blogs/${doc._raw.flattenedPath}`,
    },
  },
}));

export default makeSource({
  contentDirPath: 'posts',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: 'github-dark', // 코드작성시 적용할 테마
        },
      ],
      rehypeAutolinkHeadings,
      highlight,
    ],
  },
});
