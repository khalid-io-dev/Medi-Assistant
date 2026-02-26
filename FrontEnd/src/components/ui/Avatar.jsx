import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  className,
  fallbackClassName,
  status,
  statusPosition = 'bottom-right',
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name) => {
    const colors = [
      'bg-primary-500',
      'bg-secondary-500',
      'bg-accent-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[index % colors.length];
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-slate-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const statusPositionStyles = {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={cn(
            'rounded-full object-cover border-2 border-white shadow-sm',
            sizeStyles[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center text-white font-medium border-2 border-white shadow-sm',
            getRandomColor(name),
            sizeStyles[size],
            fallbackClassName
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute w-3 h-3 rounded-full border-2 border-white',
            statusColors[status],
            statusPositionStyles[statusPosition]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
