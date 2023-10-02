import { Nanum_Gothic, Nanum_Gothic_Coding } from 'next/font/google';

export const nanum = Nanum_Gothic({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: 'normal',
});

export const nanumCoding = Nanum_Gothic_Coding({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal'],
});
