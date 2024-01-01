import { Toc } from '@/components/BlogMenu';

export const findH = (article: string): Toc[] => {
  const findTitle = article
    .split(`\n`)
    .filter(line => line.match(/(^#{1,3})\s/));

  const toc: Toc[] = findTitle.map(title => {
    let name = title
      .replace(/[\*,\~]{2,}/g, '')
      .replace(/(?<=\])\((.*?)\)/g, '')
      .replace(/(?<!\S)((http)(s?):\/\/|www\.).+?(?=\s)/g, '');

    const slug = name
      .replace(/^##*\s/, '')
      .toLowerCase()
      .replace(/[^a-z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣 -]/g, '')
      .replace(/\s/g, '-');
    if (title.startsWith('###')) {
      return { id: 'sub', title: name.replace(/^##*\s/, ''), slug };
    }
    return { id: 'title', title: name.replace(/^##*\s/, ''), slug };
  });

  return toc;
};
