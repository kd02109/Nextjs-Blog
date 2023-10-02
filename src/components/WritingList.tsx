import ProjectWitingList from '@/components/ProjectWitingList';
import { allPosts } from 'contentlayer/generated';

type Prop = {
  tag: string;
};
export default function WritingList({ tag }: Prop) {
  const posts = allPosts.filter(post => post.url.includes(tag));

  return (
    <section className="mt-10">
      <h2 className="font-bold text-2xl mb-2">프로젝트 회고</h2>
      <p className="text-xl mb-2">
        프로젝트 진행 과정에서 마주친 문제점, 구현 과정, 느낀 점 등을
        정리하였습니다!
      </p>
      <ul className="flex flex-col">
        {posts.map(item => (
          <ProjectWitingList key={item._id} {...item} />
        ))}
      </ul>
    </section>
  );
}
