import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Card = ({
  children,
  className,
  padding = 'lg',
  hover = false,
  onClick,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-slate-100 overflow-hidden',
        'shadow-card',
        hover && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
        onClick && 'cursor-pointer',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, action }) => (
  <div className={cn('flex items-start justify-between mb-4', className)}>
    <div className="flex-1">{children}</div>
    {action && <div className="ml-4">{action}</div>}
  </div>
);

const CardTitle = ({ children, className }) => (
  <h3 className={cn('text-lg font-semibold text-text-primary', className)}>
    {children}
  </h3>
);

const CardDescription = ({ children, className }) => (
  <p className={cn('text-sm text-text-muted mt-1', className)}>
    {children}
  </p>
);

const CardContent = ({ children, className }) => (
  <div className={cn('', className)}>
    {children}
  </div>
);

const CardFooter = ({ children, className }) => (
  <div className={cn('mt-6 pt-4 border-t border-slate-100 flex items-center gap-3', className)}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
