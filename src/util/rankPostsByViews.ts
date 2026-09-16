type RankablePost = {
  id: string;
  url: string;
  date: string;
};

export default function rankPostsByViews<T extends RankablePost>(
  posts: T[],
  viewCounts: Readonly<Record<string, number>>,
  limit = 4,
) {
  const getSlug = (post: T) => post.url.split('/').at(-1) ?? post.id;

  return [...posts]
    .sort((a, b) => {
      const viewDifference =
        (viewCounts[getSlug(b)] ?? 0) - (viewCounts[getSlug(a)] ?? 0);

      if (viewDifference !== 0) return viewDifference;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);
}
