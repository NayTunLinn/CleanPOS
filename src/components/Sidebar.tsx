import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingCart, Package, Receipt, BarChart3, LogOut, Sun, Moon, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useState } from 'react';

export type View = 'pos' | 'dashboard' | 'products' | 'orders' | 'sales';

interface SidebarProps {
  view: View;
  onNavigate: (view: View) => void;
}

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'pos', label: 'Checkout', icon: ShoppingCart },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales', icon: BarChart3 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: Receipt },
];

export function Sidebar({ view, onNavigate }: SidebarProps) {
  const { cartCount } = useStore();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = (v: View) => {
    onNavigate(v);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-20 flex-col items-center border-r border-border bg-card py-5 lg:flex lg:w-64">
        <div className="mb-8 flex h-14 w-full items-center justify-center px-2 lg:h-16">
          <picture className="block h-12 w-14 lg:h-14 lg:w-48">
            <img src="/assets/logos/minimartLight.png" alt="MiniMart" className="h-full w-full object-contain dark:hidden" />
            <img src="/assets/logos/minimartDark.png" alt="MiniMart" className="hidden h-full w-full object-contain dark:block" />
          </picture>
        </div>

        <nav className="flex w-full flex-1 flex-col gap-1.5 px-3">
          {NAV.map((item) => {
            const active = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                  active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon size={20} className={cn('shrink-0 transition-transform duration-200', active ? 'scale-105' : 'group-hover:scale-105')} />
                <span className="hidden lg:block">{item.label}</span>
                {item.id === 'pos' && cartCount > 0 && (
                  <span className="absolute right-2 top-1.5 flex h-5 min-w-[20px] animate-scale-in items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground lg:right-3 lg:top-3">
                    {cartCount}
                  </span>
                )}
                {active && (
                  <span className="absolute -left-3 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-full bg-primary lg:block" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="w-full px-3">
          <button
            onClick={toggleTheme}
            className={cn(
              'mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/20',
              'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {theme === 'dark' ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
            <span className="hidden lg:block">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="flex items-center gap-2.5 rounded-xl bg-muted px-3 py-2.5 transition hover:bg-muted/80">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              {user?.initials ?? 'A'}
            </div>
            <div className="hidden flex-1 lg:block">
              <p className="text-xs font-bold text-foreground">{user?.name ?? 'Alex Morgan'}</p>
              <p className="text-[11px] font-medium text-muted-foreground">{user?.role ?? 'Cashier'}</p>
            </div>
            <button
              onClick={logout}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive lg:ml-auto"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer (opened from More button in bottom nav) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in" />
          <div
            className="absolute bottom-0 left-0 right-0 animate-slide-in-right rounded-t-2xl border-t border-border bg-card p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {user?.initials ?? 'A'}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{user?.name ?? 'Alex Morgan'}</p>
                  <p className="text-xs font-medium text-muted-foreground">{user?.role ?? 'Cashier'}</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-muted py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={logout}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive/10 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/15"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card px-1 py-1.5 lg:hidden">
        {NAV.map((item) => {
          const active = view === item.id;
          const Icon = item.icon;
          const isMore = item.id === 'orders';
          return (
            <button
              key={item.id}
              onClick={() => (isMore ? setDrawerOpen(true) : handleNavigate(item.id))}
              className={cn(
                'relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-all duration-200',
                active && !isMore
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <Icon size={20} className={cn('shrink-0', active && !isMore && 'scale-110')} />
              <span>{item.label}</span>
              {item.id === 'pos' && cartCount > 0 && (
                <span className="absolute right-1 top-0 flex h-4 min-w-[16px] animate-scale-in items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
              {active && !isMore && (
                <span className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
