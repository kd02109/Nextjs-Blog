import LoadingIcon from '@/components/svg/Loading';

export default function Loading() {
  return (
    <div className="w-full h-80 flex items-center justify-center">
      <div className="loader loader--style1" title="0">
        <LoadingIcon width="100px" height="100px" />
      </div>
    </div>
  );
}
