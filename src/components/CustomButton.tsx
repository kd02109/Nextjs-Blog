'use client';
type Prop = {
  children: React.ReactNode;
  className?: string;
  fn: () => void;
};

export default function CustomButton({ children, fn, className }: Prop) {
  return (
    <button
      className={
        className ||
        'w-10 h-10 rounded-full dark:bg-slate-200 bg-slate-600 left-1 top-1 flex items-center justify-center cursor-pointer max-sm:w-7 max-sm:h-7'
      }
      onClick={fn}>
      {children}
    </button>
  );
}
