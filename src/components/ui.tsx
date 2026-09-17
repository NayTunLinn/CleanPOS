import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white shadow-soft transition-shadow duration-200 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none',
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
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-soft hover:shadow-soft-md active:scale-[.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[.98] dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
    ghost: 'text-slate-600 hover:bg-slate-100 active:scale-[.98] dark:text-zinc-300 dark:hover:bg-zinc-800',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-[.98] dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[.98] dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-600',
    success: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft hover:shadow-soft-md active:scale-[.98] dark:bg-brand-600 dark:hover:bg-brand-500',
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
    success: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
    warning: 'bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-400',
    danger: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    neutral: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400',
    info: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400',
  };
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
