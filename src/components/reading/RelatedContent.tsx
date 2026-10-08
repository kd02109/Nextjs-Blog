import Link from 'next/link';

export type ArticleSummary = {
  title: string;
  href: string;
  label?: string;
};

type Props = {
  posts: ArticleSummary[];
  backHref?: string;
};

export default function RelatedContent({ posts, backHref }: Props) {
  return (
    <nav className="reading-related" aria-label="이어서 읽기">
      {backHref && (
        <Link href={backHref}>
          <span>← ALL NOTES</span>
          <strong>목록으로 돌아가기</strong>
        </Link>
      )}
      {posts.map(post => (
        <Link href={post.href} key={post.href}>
          <span>{post.label ?? 'RELATED NOTE'} →</span>
          <strong>{post.title}</strong>
        </Link>
      ))}
    </nav>
  );
}
