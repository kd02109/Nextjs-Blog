import Link from 'next/link';

type Topic = {
  key: string;
  label: string;
  count: number;
};

export default function TopicLinks({ topics }: { topics: Topic[] }) {
  return (
    <div className="home-topic-list">
      {topics.map(topic => (
        <Link
          key={topic.key}
          href={`/tags?key=${encodeURIComponent(topic.key)}`}
          className="home-topic-link"
          aria-label={`${topic.label} 글 ${topic.count}개 보기`}>
          <span>{topic.label}</span>
          <span>{topic.count}편 ↗</span>
        </Link>
      ))}
    </div>
  );
}
