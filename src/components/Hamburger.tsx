'use client';

import { SetStateAction, useEffect, useRef } from 'react';
import { siteConfig } from '@/config';
import HambugerIcon from '@/components/svg/HamburgerIcon';
import LinkItem from '@/components/LinkItem';
import XIcon from '@/components/svg/XIcon';
import { motion } from 'framer-motion';
import DarkSwitch from '@/components/DarkSwitch';
import { allowScroll, preventScroll } from '@/util/scrollControl';

type Prop = {
  pathName: string;
  isOpened: boolean;
  setIsOpened: React.Dispatch<SetStateAction<boolean>>;
};

export default function Hamburger({ pathName, isOpened, setIsOpened }: Prop) {
  const { menus } = siteConfig;
  const handleOpen = () => {
    setIsOpened(true);
  };
  const ref = useRef<HTMLDivElement>(null);
  // 화면 이전시 UI 초기화
  useEffect(() => {
    setIsOpened(false);
  }, [pathName, setIsOpened]);

  //휴대폰 화면에서 햄버거를 열었을 때 scroll 동작 하는 것 막기
  useEffect(() => {
    if (isOpened) {
      preventScroll();
    }
    return () => {
      allowScroll();
    };
  }, [isOpened]);

  return (
    <>
      {!isOpened && (
        <motion.button
          dragSnapToOrigin
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ ease: 'linear', duration: 0.3 }}
          className="hidden max-md:block"
          onClick={handleOpen}>
          <HambugerIcon />
          <span className="hidden">HamburgerIcon</span>
        </motion.button>
      )}
      {isOpened && (
        <div
          className="hidden overflow-hidden fixed w-100 h-[100%] top-0 left-0 right-0 bottom-0 z-60 max-md:block before:content-[ ] before:fixed before:top-0 before:left-0 before:right-0 before:bottom-0 before:backdrop-blur"
          onClick={e => {
            e.stopPropagation();
            setIsOpened(false);
          }}>
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ ease: 'linear', duration: 0.3 }}
            className="fixed w-60 h-100 p-4 top-0 right-0 left-0 bottom-0 overflow-hidden hidden max-md:block z-80 bg-white dark:bg-[#121212] rounded-xl">
            <div className="flex justify-between my-4">
              <nav>
                <ol>
                  <li
                    className={`py-4 border-b-2 border-solid w-40 ${
                      pathName === '/' && 'border-yellow-400'
                    }`}>
                    <LinkItem href={'/'} isActive={pathName === '/'}>
                      Home
                    </LinkItem>
                  </li>
                  {menus.map(({ path, label }) => (
                    <li
                      key={label}
                      className={`py-4 border-b-2 border-solid w-40 ${
                        pathName.includes(path) && 'border-yellow-400'
                      }`}>
                      <LinkItem href={path} isActive={pathName.includes(path)}>
                        {label}
                      </LinkItem>
                    </li>
                  ))}
                </ol>
              </nav>
              <button
                className="self-start py-4"
                onClick={() => {
                  setIsOpened(false);
                }}>
                <span className="hidden">Cancle Button</span>
                <XIcon />
              </button>
            </div>
            <DarkSwitch />
          </motion.div>
        </div>
      )}
    </>
  );
}
