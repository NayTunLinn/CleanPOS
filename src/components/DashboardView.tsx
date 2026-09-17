import { TrendingUp, ShoppingBag, Receipt, Package, ArrowUpRight, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatTime } from '@/lib/format';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

export function DashboardView() {
  const { orders, products } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
  const lowStock = products.filter((p) => p.stock < 15);

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, accent: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400', ring: 'ring-brand-100 dark:ring-brand-900' },
    { label: 'Orders', value: orders.length, icon: Receipt, accent: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400', ring: 'ring-blue-100 dark:ring-blue-900' },
    { label: 'Items Sold', value: totalItems, icon: ShoppingBag, accent: 'bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400', ring: 'ring-accent-100 dark:ring-accent-900' },
    { label: 'Avg Order', value: formatCurrency(avgOrder), icon: ArrowUpRight, accent: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', ring: 'ring-slate-200 dark:ring-slate-700' },
  ];

  const topProducts = (() => {
    const map = new Map<string, { name: string; emoji: string; qty: number; revenue: number }>();
    orders.forEach((o) =>
      o.items.forEach((i) => {
        const cur = map.get(i.product.id) ?? { name: i.product.name, emoji: i.product.emoji, qty: 0, revenue: 0 };
        cur.qty += i.quantity;
        cur.revenue += i.product.price * i.quantity;
        map.set(i.product.id, cur);
      }),
    );
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  })();

  const maxRevenue = topProducts[0]?.revenue ?? 1;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm font-medium text-slate-400 dark:text-slate-500">Sales overview and performance</p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-soft dark:bg-slate-900 dark:shadow-none sm:flex">
          <Zap size={16} className="text-brand-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Live data</span>
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand-500" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="animate-fade-in-up p-5 hover:shadow-soft-md"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl ring-1', stat.accent, stat.ring)}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-3.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Top Products</h2>
            <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">By Revenue</span>
          </div>
          {topProducts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <TrendingUp size={32} className="mb-2 text-slate-200 dark:text-slate-700" />
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No sales yet — complete an order to see data</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {topProducts.map((p, idx) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{idx + 1}</span>
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(p.revenue)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                        style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-14 text-right text-xs font-medium text-slate-400 dark:text-slate-500">{p.qty} sold</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400">
              <Package size={16} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Low Stock</h2>
          </div>
          {lowStock.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <Package size={32} className="mb-2 text-slate-200 dark:text-slate-700" />
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">All products well stocked</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700">
                  <span className="text-xl">{p.emoji}</span>
                  <span className="flex-1 text-sm font-semibold text-slate-900 dark:text-white">{p.name}</span>
                  <span
                    className={cn(
                      'badge',
                      p.stock === 0
                        ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                        : p.stock < 10
                          ? 'bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                    )}
                  >
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="mt-6 p-5">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Recent Orders</h2>
        {orders.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <Receipt size={32} className="mb-2 text-slate-200 dark:text-slate-700" />
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">{o.id}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {o.items.reduce((s, i) => s + i.quantity, 0)} items · <span className="capitalize">{o.paymentMethod}</span>
                    </p>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{formatTime(o.createdAt)}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(o.total)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
