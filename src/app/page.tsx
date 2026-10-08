import '@/styles/home.css';

import type { Metadata } from 'next';

import FieldNoteHero from '@/components/home/FieldNoteHero';
import type { HomePost } from '@/components/home/HomePostList';
import PopularPosts from '@/components/home/PopularPosts';
import ProjectTeaser from '@/components/home/ProjectTeaser';
import RecentWriting from '@/components/home/RecentWriting';
import TopicLinks from '@/components/home/TopicLinks';
import SectionHeading from '@/components/ui/SectionHeading';
import { sharedOpenGraphMetadata } from '@/config';
import type { ProjectType } from '@/types/projectType';
import getPosts from '@/util/getPosts';
import { projectObj } from '@/util/project';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    ...sharedOpenGraphMetadata,
    url: '/',
    title: 'SON의 개발 블로그',
    description: '개발하면서 느낀점, 배운점을 기록합니다.',
    images: 'https://source.unsplash.com/random/300×300',
  },
};

const topicOptions = [
  { key: 'react', label: 'React' },
  { key: 'nextJs', label: 'Next.js' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'typescript', label: 'TypeScript' },
] as const;

export default function Home() {
  const posts = getPosts('blog');
  const postSummaries: HomePost[] = posts.map(
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
  const featured = postSummaries[0];
  const recentPosts = postSummaries.slice(0, 4);
  const projects = (['nextjs-blog', 'sharepetment'] as const)
    .map(slug => projectObj.find(project => project.link === slug))
    .filter((project): project is ProjectType => project !== undefined);
  const topics = topicOptions.map(topic => ({
    ...topic,
    count: postSummaries.filter(post => post.tag.includes(topic.key)).length,
  }));

  if (!featured) {
    return (
      <section className="home-empty">
        <h1>아직 공개된 글이 없습니다.</h1>
        <p>새 기록이 준비되면 이곳에서 먼저 소개합니다.</p>
      </section>
    );
  }

  return (
    <div className="home-page">
      <FieldNoteHero featured={featured} />

      <section
        id="writing"
        className="home-writing"
        aria-labelledby="recent-writing-title">
        <SectionHeading
          id="recent-writing-title"
          eyebrow="WRITING / NOTES FROM THE WORK"
          title="차곡차곡 쌓인 기록"
          description="실제로 부딪힌 문제에서 출발한 글을 주제별로 찾아볼 수 있습니다."
          action={{ href: '/blog', label: '모든 글 보기' }}
        />
        <RecentWriting posts={recentPosts} />
      </section>

      <section className="home-popular" aria-labelledby="popular-posts-title">
        <SectionHeading
          id="popular-posts-title"
          eyebrow="POPULAR / MOST READ"
          title="많이 읽은 기록"
          description="자주 찾아보는 글을 모았습니다."
        />
        <PopularPosts posts={postSummaries} />
      </section>

      <section
        id="projects"
        className="home-projects-band"
        aria-labelledby="home-projects-title">
        <SectionHeading
          id="home-projects-title"
          eyebrow="SELECTED WORK / BUILT TO LEARN"
          title="손으로 끝까지 만든 것들"
          description="설계하고, 만들고, 다듬은 경험을 프로젝트별로 정리했습니다."
          action={{ href: '/projects', label: '전체 프로젝트' }}
        />
        <ProjectTeaser projects={projects} />
      </section>

      <section className="home-topics" aria-labelledby="home-topics-title">
        <div className="home-topics-layout">
          <SectionHeading
            id="home-topics-title"
            eyebrow="TOPICS / FIND YOUR WAY IN"
            title="어떤 기록을 찾고 있나요?"
            description="기술과 주제별로 지금까지의 기록을 찾아볼 수 있습니다."
          />
          <TopicLinks topics={topics} />
        </div>
      </section>
    </div>
  );
}
