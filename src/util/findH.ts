import GithubSlugger from 'github-slugger';

export type Toc = { title: string; slug: string; id: 'sub' | 'title' };

const inlineText = (value: string) =>
  value
    .replace(/[ \t]+#+[ \t]*$/, '')
    .replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '$1')
    .replace(/(?<!\w)_([^_]+)_(?!\w)/g, '$1')
    .trim();

/** Match rehype-slug's order while excluding headings inside fenced code. */
export const findH = (article: string): Toc[] => {
  const slugger = new GithubSlugger();
  const toc: Toc[] = [];
  let fence: { marker: string; length: number } | undefined;

  for (const line of article.split(/\r?\n/)) {
    const possibleFence = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      const closing = line.match(/^ {0,3}(`+|~+)[ \t]*$/);
      if (
        closing &&
        closing[1][0] === fence.marker &&
        closing[1].length >= fence.length
      ) {
        fence = undefined;
      }
      continue;
    }
    if (possibleFence) {
      fence = {
        marker: possibleFence[1][0],
        length: possibleFence[1].length,
      };
      continue;
    }

    const heading = line.match(/^ {0,3}(#{1,6})(?:[ \t]+|$)(.*)$/);
    if (!heading) continue;

    const depth = heading[1].length;
    const title = inlineText(heading[2]);
    const slug = slugger.slug(title);
    if (depth === 2 || depth === 3) {
      toc.push({ id: depth === 3 ? 'sub' : 'title', title, slug });
    }
  }

  return toc;
};
