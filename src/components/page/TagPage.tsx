import Link from 'next/link';

import SectionHeading from '@/components/ui/SectionHeading';
import type { ArticleSummary } from '@/components/ui/ArticleRow';
import { getAllTags } from '@/lib/content';
import getPosts from '@/util/getPosts';
import {
  archiveTopics,
  filterArchivePosts,
  normalizeArchiveTag,
} from '@/components/writing/archive';
import ArchiveHero from '@/components/writing/ArchiveHero';
import ArchiveView from '@/components/writing/ArchiveView';

const topicDescriptions = ['FRAMEWORK', 'UI LIBRARY', 'LANGUAGE', 'TYPES'];

export default function TagPage({ initialTag }: { initialTag?: string }) {
  const posts: ArticleSummary[] = getPosts().map(
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
  const selectedTag = normalizeArchiveTag(
    initialTag,
    Object.keys(getAllTags()),
  );
  const topics = [
    archiveTopics[2],
    archiveTopics[1],
    archiveTopics[3],
    archiveTopics[4],
  ];

  return (
    <div className="archive-page">
      <ArchiveHero kind="topics" count={posts.length} />
      <section
        className="archive-topic-section"
        aria-labelledby="topic-map-title">
        <div className="archive-section-top">
          <SectionHeading
            id="topic-map-title"
            eyebrow="TOPIC MAP / 01"
            title="기록을 묶는 네 가지 주제"
            description="카드를 누르면 아래 목록이 해당 주제로 바뀝니다."
            action={{ href: '/blogs', label: '블로그 글만 보기' }}
          />
        </div>
        <nav className="archive-topic-map" aria-label="주제 선택">
          {topics.map((topic, index) => (
            <Link
              key={topic.key}
              className="archive-topic-card"
              href={`/tags?key=${encodeURIComponent(topic.key)}#topic-results`}
              aria-current={selectedTag === topic.key ? 'page' : undefined}>
              <span className="archive-topic-index">
                {String(index + 1).padStart(2, '0')} /{' '}
                {topicDescriptions[index]}
              </span>
              <strong>{topic.label} ↗</strong>
              <span className="archive-topic-count">
                {filterArchivePosts(posts, topic.key, '').length} NOTES
              </span>
            </Link>
          ))}
        </nav>
      </section>
      <section
        id="topic-results"
        className="archive-section"
        aria-labelledby="topic-archive-title">
        <div className="archive-section-top">
          <SectionHeading
            id="topic-archive-title"
            eyebrow="TOPIC ARCHIVE / 02"
            title="주제별 기록"
            description="한 글이 여러 주제에 속할 수 있습니다."
          />
        </div>
        <ArchiveView
          key={selectedTag}
          posts={posts}
          initialTag={selectedTag}
          scope="all"
        />
      </section>
    </div>
  );
}
