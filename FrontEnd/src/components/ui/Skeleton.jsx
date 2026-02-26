import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Skeleton = ({
  className,
  width,
  height,
  circle = false,
  count = 1,
}) => {
  const skeletonClass = cn(
    'animate-pulse bg-slate-200 rounded-md',
    circle && 'rounded-full',
    className
  );

  const style = {
    width: width,
    height: height,
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={skeletonClass} style={style} />
        ))}
      </div>
    );
  }

  return <div className={skeletonClass} style={style} />;
};

// Pre-built skeleton layouts
const SkeletonCard = ({ className }) => (
  <div className={cn('p-6 bg-white rounded-2xl border border-slate-100', className)}>
    <div className="flex items-center space-x-4">
      <Skeleton circle width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <Skeleton width="100%" height={12} />
      <Skeleton width="90%" height={12} />
      <Skeleton width="75%" height={12} />
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex space-x-4 pb-3 border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="flex-1" height={16} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 py-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="flex-1" height={12} />
        ))}
      </div>
    ))}
  </div>
);

const SkeletonText = ({ lines = 3, className }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <Skeleton key={i} width="100%" height={12} />
    ))}
    <Skeleton width="75%" height={12} />
  </div>
);

Skeleton.Card = SkeletonCard;
Skeleton.Table = SkeletonTable;
Skeleton.Text = SkeletonText;

export default Skeleton;
