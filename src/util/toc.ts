export const toc = (data: string) => {
  const raw = data.split(`\n`).filter(line => line.match(/(^#{1,3})\s/));

  const rawMap = raw.map(item => {
    const title = item
      .replace(/^##\s/, '')
      .replace(/^###\s/, '')
      .replace(/[\*,\~]{2,}/g, '')
      .replace(/(?<=\])\((.*?)\)/g, '')
      .replace(/(?<!\S)((http)(s?):\/\/|www\.).+?(?=\s)/g, '');

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣 -]/g, '')
      .replace(/\s/g, '-');
    return { title, slug };
  });

  return rawMap;
};
