import ArticleRow, { type ArticleSummary } from '@/components/ui/ArticleRow';

export type HomePost = ArticleSummary;

type HomePostListProps = {
  posts: HomePost[];
  ariaLabel?: string;
  viewCounts?: Readonly<Record<string, number>>;
  ranked?: boolean;
};

const getPostSlug = (post: HomePost) => post.url.split('/').at(-1) ?? post.id;

export default function HomePostList({
  posts,
  ariaLabel = '글 목록',
  viewCounts,
  ranked = false,
}: HomePostListProps) {
  return (
    <ol className="ui-article-list" aria-label={ariaLabel}>
      {posts.map((post, index) => (
        <ArticleRow
          key={post.id}
          post={post}
          rank={ranked ? index + 1 : undefined}
          viewCount={viewCounts?.[getPostSlug(post)]}
        />
      ))}
    </ol>
  );
}
