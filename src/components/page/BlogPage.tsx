import SectionHeading from '@/components/ui/SectionHeading';
import type { ArticleSummary } from '@/components/ui/ArticleRow';
import ArchiveHero from '@/components/writing/ArchiveHero';
import ArchiveView from '@/components/writing/ArchiveView';
import getPosts from '@/util/getPosts';

export default function BlogPage() {
  const posts: ArticleSummary[] = getPosts('blog').map(
    ({ id, title, description, date, url, brand, tag }) => ({
      id,
      title,
      description,
      date,
      url,
      brand,
      tag,
    }),
  );

  return (
    <div className="archive-page">
      <ArchiveHero kind="writing" count={posts.length} />
      <section className="archive-section" aria-labelledby="blog-archive-title">
        <div className="archive-section-top">
          <SectionHeading
            id="blog-archive-title"
            eyebrow="THE ARCHIVE / 01"
            title="기록 탐색"
            description="주제와 검색어를 함께 적용할 수 있습니다."
            action={{ href: '/tags', label: '주제별 모아보기' }}
          />
        </div>
        <ArchiveView posts={posts} scope="blog" featured />
      </section>
    </div>
  );
}
