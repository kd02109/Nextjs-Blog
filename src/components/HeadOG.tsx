import Head from 'next/head';
type Props = {
  title: string;
  description?: string;
};
export default function HeadOG({ title, description }: Props) {
  return (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta
        property="og:image"
        content="https://source.unsplash.com/random/300×300"
      />
    </Head>
  );
}
