import BlogComment from '@/components/BlogComment';
import {
  getLegacyDiscussionTerm,
  getPublicPostPath,
} from '@/config/post-routes';
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
        href: getPublicPostPath(postFooter.prevPost),
        title: postFooter.prevPost.title,
        label: '이전 글',
      });
    }
    if (postFooter.nextPost) {
      related.push({
        href: getPublicPostPath(postFooter.nextPost),
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
          href: getPublicPostPath(neighbor),
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
        backHref={projectFooter ? `/projects/${projectFooter}` : '/blog'}
      />
      <section
        className="reading-comments"
        id="comments"
        aria-labelledby="comments-title">
        <div className="reading-comments-intro">
          <p className="reading-comments-kicker">CONVERSATION / NOTES</p>
          <h2 id="comments-title">
            읽은 뒤에 <span>남기는 메모.</span>
          </h2>
          <p>
            질문이나 다른 경험이 있다면 이어서 남겨주세요. 좋은 대화는 다음 글의
            출발점이 됩니다.
          </p>
        </div>
        <div className="reading-comments-embed">
          <BlogComment discussionTerm={getLegacyDiscussionTerm(post)} />
        </div>
      </section>
    </div>
  );
}
