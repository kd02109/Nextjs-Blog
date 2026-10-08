import BlogComment from '@/components/BlogComment';
import ArticleHeader from '@/components/reading/ArticleHeader';
import ReadingBody from '@/components/reading/ReadingBody';
import RelatedContent, {
  type ArticleSummary,
} from '@/components/reading/RelatedContent';
import TableOfContents from '@/components/reading/TableOfContents';
import type { Post } from '@/lib/content';
import type { ProjectName } from '@/types/projectType';
import { findH } from '@/util/findH';
import getPosts from '@/util/getPosts';
import '@/styles/reading.css';

type Props = {
  post: Post;
  tags: string[];
  postFooter?: {
    prevPost: Post | undefined;
    nextPost: Post | undefined;
  };
  projectFooter?: ProjectName;
};

export default function DetailPage({
  post,
  tags,
  postFooter,
  projectFooter,
}: Props) {
  const related: ArticleSummary[] = [];

  if (postFooter) {
    if (postFooter.prevPost) {
      related.push({
        href: `/blogs/${postFooter.prevPost.url}`,
        title: postFooter.prevPost.title,
        label: '이전 글',
      });
    }
    if (postFooter.nextPost) {
      related.push({
        href: `/blogs/${postFooter.nextPost.url}`,
        title: postFooter.nextPost.title,
        label: '다음 글',
      });
    }
  }

  if (projectFooter) {
    const projectPosts = getPosts('project').filter(item =>
      item.url.startsWith(`${projectFooter}/`),
    );
    const currentIndex = projectPosts.findIndex(item => item.url === post.url);
    for (const neighbor of [
      projectPosts[currentIndex - 1],
      projectPosts[currentIndex + 1],
    ]) {
      if (neighbor) {
        related.push({
          href: `/projects/${neighbor.url}`,
          title: neighbor.title,
          label: '관련 기록',
        });
      }
    }
  }

  return (
    <div
      className={`reading-page reading-page--${projectFooter ? 'project' : 'blog'}`}>
      <ArticleHeader post={post} tags={tags} />
      <div className="reading-layout">
        <TableOfContents toc={findH(post.body.raw)} />
        <ReadingBody post={post} />
      </div>
      <RelatedContent
        posts={related}
        backHref={projectFooter ? `/projects/${projectFooter}` : '/blogs'}
      />
      <section className="reading-comments" id="comments" aria-label="댓글">
        <BlogComment />
      </section>
    </div>
  );
}
