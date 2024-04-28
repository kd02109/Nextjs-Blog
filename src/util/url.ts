export default function geturl() {
  const url =
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_DEV_URL
      : process.env.NEXT_PUBLIC_URL;

  return url;
}
