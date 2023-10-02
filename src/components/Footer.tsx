import Link from 'next/link';
import Github from '@/components/svg/Github';
import Notion from '@/components/svg/Notion';
import { siteConfig } from '@/config';
export default function Footer() {
  const year = new Date().getFullYear();
  const since =
    year === siteConfig.since ? `${year}` : `${siteConfig.since - year}`;
  return (
    <footer className="border-t-2 flex flex-col h-20 justify-center items-end">
      <div className="flex gap-4 py-1 justify-end">
        <Link href="https://github.com/kd02109" target="_blank">
          <Github />
        </Link>
        <Link
          href="https://nostalgic-marquis-7af.notion.site/Front-End-f0f3b7fcec3045c482c1cd33dfcf2abc?pvs=4"
          target="_blank">
          <Notion />
        </Link>
      </div>
      <span className="text-xs sm:mx-0 sm:text-base">
        ©{since} {siteConfig.copyright}
      </span>
    </footer>
  );
}
