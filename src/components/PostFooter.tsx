import LinkHover from '@/components/LinkHover';
import LeftArrow from '@/components/svg/LeftArrow';
import RightArrow from '@/components/svg/RightArrow';
import { Post } from 'contentlayer/generated';

type PostType = Post | undefined;

type Prop = {
  nextPost: PostType;
  prevPost: PostType;
};

export default function PostFooter({ nextPost, prevPost }: Prop) {
  return (
    <div className="flex w-full justify-between my-10">
      {prevPost && (
        <div>
          <LinkHover url={prevPost.url}>
            <LeftArrow />
            {prevPost.title}
          </LinkHover>
        </div>
      )}
      {nextPost && (
        <div>
          <LinkHover url={nextPost.url}>
            {nextPost.title}
            <RightArrow />
          </LinkHover>
        </div>
      )}
    </div>
  );
}
