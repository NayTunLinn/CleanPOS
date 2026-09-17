import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white shadow-soft transition-shadow duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-soft hover:shadow-soft-md active:scale-[.98]',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[.98]',
    ghost: 'text-slate-600 hover:bg-slate-100 active:scale-[.98]',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-[.98]',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[.98]',
    success: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft hover:shadow-soft-md active:scale-[.98]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5 font-semibold',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2 font-semibold',
    lg: 'px-6 py-3 text-base rounded-xl gap-2 font-bold',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'accent';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variants = {
    success: 'bg-brand-50 text-brand-700',
    warning: 'bg-accent-50 text-accent-700',
    danger: 'bg-red-50 text-red-600',
    neutral: 'bg-slate-100 text-slate-600',
    info: 'bg-blue-50 text-blue-600',
    accent: 'bg-accent-50 text-accent-600',
  };
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
