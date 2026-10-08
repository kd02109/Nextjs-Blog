import { archiveTopics } from './archive';

type ArchiveControlsProps = {
  topic: string;
  query: string;
  scope: 'blog' | 'all';
  onTopicChange: (topic: string) => void;
  onQueryChange: (query: string) => void;
};

export default function ArchiveControls({
  topic,
  query,
  scope,
  onTopicChange,
  onQueryChange,
}: ArchiveControlsProps) {
  const customTopic =
    topic !== 'all' && !archiveTopics.some(option => option.key === topic)
      ? { key: topic, label: topic }
      : null;
  const options = customTopic ? [...archiveTopics, customTopic] : archiveTopics;

  return (
    <div className="archive-tools">
      <div
        className="archive-filters"
        role="group"
        aria-label={scope === 'blog' ? '글 주제 필터' : '주제 필터'}>
        {options.map(option => (
          <button
            className="archive-filter"
            key={option.key}
            type="button"
            aria-pressed={topic === option.key}
            onClick={() => onTopicChange(option.key)}>
            {option.label}
          </button>
        ))}
      </div>
      <label className="archive-search">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          aria-label={scope === 'blog' ? '글 검색' : '주제별 기록 검색'}
          placeholder={
            scope === 'blog' ? '제목이나 내용 검색' : '이 주제에서 검색'
          }
          autoComplete="off"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
        />
      </label>
    </div>
  );
}
