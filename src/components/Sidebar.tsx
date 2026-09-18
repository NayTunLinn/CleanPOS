import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingCart, Package, Receipt, BarChart3, LogOut, Sun, Moon } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

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

  return (
    <aside className="flex h-full w-20 flex-col items-center border-r border-slate-200/70 bg-white py-5 dark:border-zinc-800 dark:bg-zinc-900 lg:w-64">
      <div className="mb-9 flex h-16 w-full items-center justify-center px-2">
        <picture className="block h-12 w-14 lg:h-16 lg:w-48">
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
              onClick={() => onNavigate(item.id)}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200',
                active
                  ? 'bg-slate-900 text-white shadow-soft dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white',
              )}
            >
              <Icon size={20} className={cn('shrink-0 transition-transform duration-200', active ? 'scale-105' : 'group-hover:scale-105')} />
              <span className="hidden lg:block">{item.label}</span>
              {item.id === 'pos' && cartCount > 0 && (
                <span className="absolute right-2 top-1.5 flex h-5 min-w-[20px] animate-scale-in items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white lg:right-3 lg:top-3">
                  {cartCount}
                </span>
              )}
              {active && (
                <span className="absolute -left-3 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-full bg-brand-500 lg:block" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="w-full px-3">
        <button
          onClick={toggleTheme}
          className={cn(
            'mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
            'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white',
          )}
        >
          {theme === 'dark' ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          <span className="hidden lg:block">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 transition hover:bg-slate-100/70 dark:bg-zinc-800 dark:hover:bg-zinc-700/70">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-sm font-bold text-white shadow-soft">
            {user?.initials ?? 'A'}
          </div>
          <div className="hidden flex-1 lg:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name ?? 'Alex Morgan'}</p>
            <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">{user?.role ?? 'Cashier'}</p>
          </div>
          <button
            onClick={logout}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 lg:ml-auto"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
