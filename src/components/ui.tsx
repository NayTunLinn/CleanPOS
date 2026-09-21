import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground transition-shadow duration-200 dark:shadow-none',
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
    primary:
      'bg-foreground text-background hover:bg-foreground/90 active:scale-[.98] focus-visible:ring-2 focus-visible:ring-ring/30',
    secondary:
      'bg-muted text-foreground hover:bg-muted/80 active:scale-[.98] focus-visible:ring-2 focus-visible:ring-ring/30',
    ghost:
      'text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[.98] focus-visible:ring-2 focus-visible:ring-ring/20',
    danger:
      'bg-destructive/10 text-destructive hover:bg-destructive/15 active:scale-[.98] focus-visible:ring-2 focus-visible:ring-destructive/20',
    outline:
      'border border-border text-foreground hover:bg-muted active:scale-[.98] focus-visible:ring-2 focus-visible:ring-ring/20',
    success:
      'bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[.98] focus-visible:ring-2 focus-visible:ring-ring/30',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5 font-semibold',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2 font-semibold',
    lg: 'px-6 py-3 text-base rounded-xl gap-2 font-bold',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 outline-none disabled:opacity-40 disabled:pointer-events-none',
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
    success: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    warning: 'bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-300',
    danger: 'bg-destructive/10 text-destructive',
    neutral: 'bg-muted text-muted-foreground',
    info: 'bg-info/10 text-info',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400',
  };
  return (
    <span className={cn('badge', variants[variant], className)}>{children}</span>
  );
}
