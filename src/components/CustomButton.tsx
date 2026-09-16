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
        'h-11 w-11 rounded-full dark:bg-slate-200 bg-slate-600 left-1 top-1 flex items-center justify-center cursor-pointer'
      }
      onClick={fn}>
      {children}
    </button>
  );
}
