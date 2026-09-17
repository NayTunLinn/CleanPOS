import { useMemo, useState } from 'react';
import { TrendingUp, DollarSign, CreditCard, Banknote, Calendar, Download, ShoppingBag, BarChart3 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/format';
import { Card, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

type Period = 'today' | '7d' | '30d' | 'all';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'all', label: 'All Time' },
];

export function SalesView() {
  const { orders } = useStore();
  const [period, setPeriod] = useState<Period>('all');

  const filteredOrders = useMemo(() => {
    if (period === 'all') return orders;
    const now = Date.now();
    const ranges: Record<Period, number> = {
      today: 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      all: 0,
    };
    const cutoff = now - ranges[period];
    return orders.filter((o) => o.createdAt >= cutoff);
  }, [orders, period]);

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
  const totalTax = filteredOrders.reduce((s, o) => s + o.tax, 0);
  const totalItems = filteredOrders.reduce(
    (s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0),
    0,
  );
  const cardRevenue = filteredOrders
    .filter((o) => o.paymentMethod === 'card')
    .reduce((s, o) => s + o.total, 0);
  const cashRevenue = filteredOrders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((s, o) => s + o.total, 0);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<Category, { revenue: number; qty: number }>();
    filteredOrders.forEach((o) =>
      o.items.forEach((i) => {
        const cur = map.get(i.product.category) ?? { revenue: 0, qty: 0 };
        cur.revenue += i.product.price * i.quantity;
        cur.qty += i.quantity;
        map.set(i.product.category, cur);
      }),
    );
    return [...map.entries()].sort((a, b) => b[1].revenue - a[1].revenue);
  }, [filteredOrders]);

  const dailyBreakdown = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number; items: number }>();
    filteredOrders.forEach((o) => {
      const dayKey = formatDate(o.createdAt);
      const cur = map.get(dayKey) ?? { revenue: 0, orders: 0, items: 0 };
      cur.revenue += o.total;
      cur.orders += 1;
      cur.items += o.items.reduce((s, i) => s + i.quantity, 0);
      map.set(dayKey, cur);
    });
    return [...map.entries()].reverse();
  }, [filteredOrders]);

  const maxCatRevenue = categoryBreakdown[0]?.[1].revenue ?? 1;
  const maxDailyRevenue = Math.max(...dailyBreakdown.map((d) => d[1].revenue), 1);

  const stats = [
    { label: 'Total Sales', value: formatCurrency(totalRevenue), icon: DollarSign, accent: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400', ring: 'ring-brand-100 dark:ring-brand-900' },
    { label: 'Net Revenue', value: formatCurrency(totalRevenue - totalTax), icon: TrendingUp, accent: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400', ring: 'ring-blue-100 dark:ring-blue-900' },
    { label: 'Tax Collected', value: formatCurrency(totalTax), icon: Calendar, accent: 'bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400', ring: 'ring-accent-100 dark:ring-accent-900' },
    { label: 'Items Sold', value: totalItems, icon: ShoppingBag, accent: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', ring: 'ring-slate-200 dark:ring-slate-700' },
  ];

  const handleExport = () => {
    const header = 'Order ID,Date,Time,Items,Subtotal,Tax,Total,Payment\n';
    const rows = filteredOrders
      .map((o) => {
        const d = new Date(o.createdAt);
        const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
        return `${o.id},${d.toLocaleDateString()},${d.toLocaleTimeString()},${itemCount},${o.subtotal.toFixed(2)},${o.tax.toFixed(2)},${o.total.toFixed(2)},${o.paymentMethod}`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Sales Report</h1>
          <p className="mt-0.5 text-sm font-medium text-slate-400 dark:text-slate-500">Track revenue and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
                  period === p.id
                    ? 'bg-slate-900 text-white shadow-soft dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="md" onClick={handleExport} disabled={filteredOrders.length === 0}>
            <Download size={16} /> Export
          </Button>
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
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl ring-1', stat.accent, stat.ring)}>
                <Icon size={20} />
              </div>
              <p className="mt-3.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <BarChart3 size={16} />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Revenue by Category</h2>
            </div>
          </div>
          {categoryBreakdown.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <BarChart3 size={32} className="mb-2 text-slate-200 dark:text-slate-700" />
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No sales data for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map(([category, data]) => (
                <div key={category} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-300">{category}</span>
                  <div className="flex-1">
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                        style={{ width: `${(data.revenue / maxCatRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 text-right text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(data.revenue)}</span>
                  <span className="w-14 text-right text-xs font-medium text-slate-400 dark:text-slate-500">{data.qty} qty</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-5 text-base font-bold text-slate-900 dark:text-white">Payment Methods</h2>
          {filteredOrders.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <CreditCard size={32} className="mb-2 text-slate-200 dark:text-slate-700" />
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No sales data for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-soft dark:bg-slate-100 dark:text-slate-900">
                  <CreditCard size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Card Payments</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {filteredOrders.filter((o) => o.paymentMethod === 'card').length} orders
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrency(cardRevenue)}</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {totalRevenue > 0 ? Math.round((cardRevenue / totalRevenue) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft dark:bg-brand-600">
                  <Banknote size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cash Payments</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {filteredOrders.filter((o) => o.paymentMethod === 'cash').length} orders
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrency(cashRevenue)}</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {totalRevenue > 0 ? Math.round((cashRevenue / totalRevenue) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Daily breakdown table */}
      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Sales Breakdown</h2>
          <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{dailyBreakdown.length} days</span>
        </div>
        {dailyBreakdown.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <Calendar size={32} className="mb-2 text-slate-200 dark:text-slate-700" />
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No sales data for this period</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-500">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Orders</th>
                <th className="px-5 py-3.5 text-right">Items</th>
                <th className="px-5 py-3.5 text-right">Revenue</th>
                <th className="px-5 py-3.5 text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {dailyBreakdown.map(([date, data]) => (
                <tr key={date} className="border-b border-slate-50 transition hover:bg-slate-50/50 dark:border-slate-800/50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-900 dark:text-white">{date}</td>
                  <td className="px-5 py-3.5 text-right text-sm font-medium text-slate-600 dark:text-slate-300">{data.orders}</td>
                  <td className="px-5 py-3.5 text-right text-sm font-medium text-slate-600 dark:text-slate-300">{data.items}</td>
                  <td className="px-5 py-3.5 text-right text-sm font-extrabold text-slate-900 dark:text-white">{formatCurrency(data.revenue)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                          style={{ width: `${(data.revenue / maxDailyRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-medium text-slate-400 dark:text-slate-500">
                        {totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
