'use client';
import Article from '@/components/Article';
import MultiCarousel from '@/components/MultiCarousel';
import { Post } from 'contentlayer/generated';

export default function CardCarousel({ posts }: { posts: Post[] }) {
  return (
    <div>
      <h3 className="font-bold text-lg my-2">You may Like</h3>
      <MultiCarousel>
        {posts.map((item, index) => (
          <Article key={item.id} {...item} index={index} />
        ))}
      </MultiCarousel>
    </div>
  );
}
