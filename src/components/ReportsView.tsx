import { useMemo, useState } from 'react';
import { FileText, Package, Download, Receipt, Calendar, TrendingUp, Sigma } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { Card, Button, Badge, MoneyCell } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Order, Product } from '@/lib/types';

type Period = 'today' | '7d' | '30d' | 'all';
type ReportTab = 'invoice' | 'product';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'all', label: 'All Time' },
];

const TABS: { id: ReportTab; label: string; icon: typeof FileText }[] = [
  { id: 'invoice', label: 'Sales by Invoice', icon: Receipt },
  { id: 'product', label: 'Net Sales by Product', icon: Package },
];

export function ReportsView() {
  const { orders } = useStore();
  const [period, setPeriod] = useState<Period>('all');
  const [tab, setTab] = useState<ReportTab>('invoice');

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

  const grandTotalSubtotal = filteredOrders.reduce((s, o) => s + o.subtotal, 0);
  const grandTotalTax = filteredOrders.reduce((s, o) => s + o.tax, 0);
  const grandTotalTotal = filteredOrders.reduce((s, o) => s + o.total, 0);
  const grandTotalItems = filteredOrders.reduce(
    (s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0),
    0,
  );

  const productBreakdown = useMemo(() => {
    const map = new Map<string, { product: Product; qty: number; grossSales: number; netSales: number; taxAmount: number; orderCount: number }>();
    filteredOrders.forEach((o) =>
      o.items.forEach((i) => {
        const cur = map.get(i.product.id) ?? {
          product: i.product,
          qty: 0,
          grossSales: 0,
          netSales: 0,
          taxAmount: 0,
          orderCount: 0,
        };
        const lineGross = i.product.price * i.quantity;
        const lineTax = lineGross * 0.05;
        const lineNet = lineGross - lineTax;
        cur.qty += i.quantity;
        cur.grossSales += lineGross;
        cur.taxAmount += lineTax;
        cur.netSales += lineNet;
        cur.orderCount += 1;
        map.set(i.product.id, cur);
      }),
    );
    return [...map.values()].sort((a, b) => b.netSales - a.netSales);
  }, [filteredOrders]);

  const netSalesGrandTotal = productBreakdown.reduce((s, p) => s + p.netSales, 0);
  const grossSalesGrandTotal = productBreakdown.reduce((s, p) => s + p.grossSales, 0);
  const taxGrandTotal = productBreakdown.reduce((s, p) => s + p.taxAmount, 0);
  const qtyGrandTotal = productBreakdown.reduce((s, p) => s + p.qty, 0);

  const handleExport = () => {
    if (tab === 'invoice') {
      const header = 'Order ID,Date,Time,Items,Subtotal,Tax,Total,Payment,Status\n';
      const rows = filteredOrders
        .map((o) => {
          const d = new Date(o.createdAt);
          const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
          return `${o.id},${d.toLocaleDateString()},${d.toLocaleTimeString()},${itemCount},${o.subtotal.toFixed(2)},${o.tax.toFixed(2)},${o.total.toFixed(2)},${o.paymentMethod},${o.status}`;
        })
        .join('\n');
      const totals = `\nGRAND TOTAL,,,,${grandTotalSubtotal.toFixed(2)},${grandTotalTax.toFixed(2)},${grandTotalTotal.toFixed(2)},,`;
      downloadCSV('invoice-report-' + period, header + rows + totals);
    } else {
      const header = 'Product,SKU,Category,Qty Sold,Orders,Gross Sales,Tax,Net Sales\n';
      const rows = productBreakdown
        .map((p) => `${p.product.name},${p.product.sku},${p.product.category},${p.qty},${p.orderCount},${p.grossSales.toFixed(2)},${p.taxAmount.toFixed(2)},${p.netSales.toFixed(2)}`)
        .join('\n');
      const totals = `\nGRAND TOTAL,,,,${qtyGrandTotal},,${grossSalesGrandTotal.toFixed(2)},${taxGrandTotal.toFixed(2)},${netSalesGrandTotal.toFixed(2)}`;
      downloadCSV('product-sales-report-' + period, header + rows + totals);
    }
  };

  const hasData = filteredOrders.length > 0;

  return (
    <div className="h-full overflow-y-auto bg-background p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">Reports</h1>
          <p className="mt-0.5 text-sm font-medium text-muted-foreground">Sales by invoice and product breakdown</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-soft">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  'whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/20 sm:px-3.5 sm:text-sm',
                  period === p.id
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="md" onClick={handleExport} disabled={!hasData} className="shrink-0">
            <Download size={16} /> <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Report tab switcher */}
      <div className="mb-4 flex gap-2 sm:mb-5">
        {TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/20',
                active
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted',
              )}
            >
              <Icon size={16} /> <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'invoice' ? (
        <InvoiceReport
          orders={filteredOrders}
          grandTotalSubtotal={grandTotalSubtotal}
          grandTotalTax={grandTotalTax}
          grandTotalTotal={grandTotalTotal}
          grandTotalItems={grandTotalItems}
          hasData={hasData}
        />
      ) : (
        <ProductReport
          breakdown={productBreakdown}
          netSalesGrandTotal={netSalesGrandTotal}
          grossSalesGrandTotal={grossSalesGrandTotal}
          taxGrandTotal={taxGrandTotal}
          qtyGrandTotal={qtyGrandTotal}
          hasData={hasData}
        />
      )}
    </div>
  );
}

function InvoiceReport({
  orders,
  grandTotalSubtotal,
  grandTotalTax,
  grandTotalTotal,
  grandTotalItems,
  hasData,
}: {
  orders: Order[];
  grandTotalSubtotal: number;
  grandTotalTax: number;
  grandTotalTotal: number;
  grandTotalItems: number;
  hasData: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <SummaryCard icon={Receipt} label="Invoices" value={orders.length.toString()} accent="bg-brand-50 text-primary dark:bg-brand-950" ring="ring-brand-200/60 dark:ring-brand-800/40" />
        <SummaryCard icon={TrendingUp} label="Net Sales" value={formatCurrency(grandTotalSubtotal)} accent="bg-info/10 text-info" ring="ring-info/20" />
        <SummaryCard icon={Calendar} label="Tax Collected" value={formatCurrency(grandTotalTax)} accent="bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400" ring="ring-accent-200/60 dark:ring-accent-800/40" />
        <SummaryCard icon={Sigma} label="Grand Total" value={formatCurrency(grandTotalTotal)} accent="bg-muted text-muted-foreground" ring="ring-border" />
      </div>

      {/* Invoice table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-5">
          <h2 className="font-display text-base font-bold text-foreground">Sales by Invoice</h2>
          <span className="badge bg-muted text-muted-foreground">{orders.length} invoices</span>
        </div>
        {!hasData ? (
          <EmptyState icon={Receipt} message="No invoices for this period" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 sm:px-5 sm:py-3.5">Invoice</th>
                  <th className="hidden px-4 py-3 sm:table-cell sm:px-5 sm:py-3.5">Date & Time</th>
                  <th className="px-4 py-3 text-right sm:px-5 sm:py-3.5">Items</th>
                  <th className="px-4 py-3 text-right sm:px-5 sm:py-3.5">Subtotal</th>
                  <th className="px-4 py-3 text-right sm:px-5 sm:py-3.5">Tax</th>
                  <th className="px-4 py-3 text-right sm:px-5 sm:py-3.5">Total</th>
                  <th className="hidden px-4 py-3 sm:table-cell sm:px-5 sm:py-3.5">Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <tr key={o.id} className="border-b border-border/50 transition hover:bg-muted/30">
                      <td className="px-4 py-3 sm:px-5 sm:py-3.5">
                        <span className="font-bold text-foreground">{o.id}</span>
                        <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:hidden">
                          {formatDate(o.createdAt)} · {formatTime(o.createdAt)}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell sm:px-5 sm:py-3.5">
                        {formatDate(o.createdAt)} · {formatTime(o.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-muted-foreground sm:px-5 sm:py-3.5">{itemCount}</td>
                      <td className="px-4 py-3 text-right sm:px-5 sm:py-3.5"><div className="flex justify-end"><MoneyCell value={formatCurrency(o.subtotal)} /></div></td>
                      <td className="px-4 py-3 text-right sm:px-5 sm:py-3.5"><div className="flex justify-end"><MoneyCell value={formatCurrency(o.tax)} /></div></td>
                      <td className="px-4 py-3 text-right sm:px-5 sm:py-3.5"><div className="flex justify-end"><MoneyCell value={formatCurrency(o.total)} emphasis="strong" /></div></td>
                      <td className="hidden px-4 py-3 sm:table-cell sm:px-5 sm:py-3.5">
                        <Badge variant="neutral" className="capitalize">{o.paymentMethod}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/40">
                  <td className="px-4 py-3.5 font-display text-sm font-extrabold text-foreground sm:px-5" colSpan={2}>
                    GRAND TOTAL
                  </td>
                  <td className="px-4 py-3.5 text-right font-display text-sm font-extrabold text-foreground sm:px-5">{grandTotalItems}</td>
                  <td className="px-4 py-3.5 text-right sm:px-5"><div className="flex justify-end"><MoneyCell value={formatCurrency(grandTotalSubtotal)} emphasis="strong" /></div></td>
                  <td className="px-4 py-3.5 text-right sm:px-5"><div className="flex justify-end"><MoneyCell value={formatCurrency(grandTotalTax)} emphasis="strong" /></div></td>
                  <td className="px-4 py-3.5 text-right sm:px-5"><div className="flex justify-end"><MoneyCell value={formatCurrency(grandTotalTotal)} emphasis="primary" className="text-base" /></div></td>
                  <td className="hidden sm:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function ProductReport({
  breakdown,
  netSalesGrandTotal,
  grossSalesGrandTotal,
  taxGrandTotal,
  qtyGrandTotal,
  hasData,
}: {
  breakdown: { product: Product; qty: number; grossSales: number; netSales: number; taxAmount: number; orderCount: number }[];
  netSalesGrandTotal: number;
  grossSalesGrandTotal: number;
  taxGrandTotal: number;
  qtyGrandTotal: number;
  hasData: boolean;
}) {
  const maxNetSales = breakdown[0]?.netSales ?? 1;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <SummaryCard icon={Package} label="Products Sold" value={breakdown.length.toString()} accent="bg-brand-50 text-primary dark:bg-brand-950" ring="ring-brand-200/60 dark:ring-brand-800/40" />
        <SummaryCard icon={TrendingUp} label="Net Sales" value={formatCurrency(netSalesGrandTotal)} accent="bg-info/10 text-info" ring="ring-info/20" />
        <SummaryCard icon={Calendar} label="Tax" value={formatCurrency(taxGrandTotal)} accent="bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400" ring="ring-accent-200/60 dark:ring-accent-800/40" />
        <SummaryCard icon={Sigma} label="Gross Sales" value={formatCurrency(grossSalesGrandTotal)} accent="bg-muted text-muted-foreground" ring="ring-border" />
      </div>

      {/* Product table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-5">
          <h2 className="font-display text-base font-bold text-foreground">Net Sales by Product</h2>
          <span className="badge bg-muted text-muted-foreground">{breakdown.length} products</span>
        </div>
        {!hasData ? (
          <EmptyState icon={Package} message="No product sales for this period" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 sm:px-5 sm:py-3.5">Product</th>
                  <th className="hidden px-4 py-3 sm:table-cell sm:px-5 sm:py-3.5">Category</th>
                  <th className="px-4 py-3 text-right sm:px-5 sm:py-3.5">Qty</th>
                  <th className="hidden px-4 py-3 text-right sm:table-cell sm:px-5 sm:py-3.5">Orders</th>
                  <th className="hidden px-4 py-3 text-right sm:table-cell sm:px-5 sm:py-3.5">Gross</th>
                  <th className="hidden px-4 py-3 text-right sm:table-cell sm:px-5 sm:py-3.5">Tax</th>
                  <th className="px-4 py-3 text-right sm:px-5 sm:py-3.5">Net Sales</th>
                  <th className="hidden px-4 py-3 sm:table-cell sm:px-5 sm:py-3.5">Share</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row) => (
                  <tr key={row.product.id} className="border-b border-border/50 transition hover:bg-muted/30">
                    <td className="px-4 py-3 sm:px-5 sm:py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl sm:text-2xl">{row.product.emoji}</span>
                        <div>
                          <p className="font-bold text-foreground">{row.product.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{row.product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell sm:px-5 sm:py-3.5">
                      <Badge variant="neutral">{row.product.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-foreground sm:px-5 sm:py-3.5">{row.qty}</td>
                    <td className="hidden px-4 py-3 text-right text-sm font-medium text-muted-foreground sm:table-cell sm:px-5 sm:py-3.5">{row.orderCount}</td>
                    <td className="hidden px-4 py-3 text-right sm:table-cell sm:px-5 sm:py-3.5"><div className="flex justify-end"><MoneyCell value={formatCurrency(row.grossSales)} /></div></td>
                    <td className="hidden px-4 py-3 text-right sm:table-cell sm:px-5 sm:py-3.5"><div className="flex justify-end"><MoneyCell value={formatCurrency(row.taxAmount)} /></div></td>
                    <td className="px-4 py-3 text-right sm:px-5 sm:py-3.5"><div className="flex justify-end"><MoneyCell value={formatCurrency(row.netSales)} emphasis="primary" /></div></td>
                    <td className="hidden px-4 py-3 sm:table-cell sm:px-5 sm:py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:w-24">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                            style={{ width: `${(row.netSales / maxNetSales) * 100}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-xs font-medium text-muted-foreground">
                          {netSalesGrandTotal > 0 ? Math.round((row.netSales / netSalesGrandTotal) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/40">
                  <td className="px-4 py-3.5 font-display text-sm font-extrabold text-foreground sm:px-5" colSpan={2}>
                    GRAND TOTAL
                  </td>
                  <td className="px-4 py-3.5 text-right font-display text-sm font-extrabold text-foreground sm:px-5">{qtyGrandTotal}</td>
                  <td className="hidden sm:table-cell" />
                  <td className="hidden px-4 py-3.5 text-right sm:table-cell sm:px-5"><div className="flex justify-end"><MoneyCell value={formatCurrency(grossSalesGrandTotal)} emphasis="strong" className="text-muted-foreground" /></div></td>
                  <td className="hidden px-4 py-3.5 text-right sm:table-cell sm:px-5"><div className="flex justify-end"><MoneyCell value={formatCurrency(taxGrandTotal)} emphasis="strong" className="text-muted-foreground" /></div></td>
                  <td className="px-4 py-3.5 text-right sm:px-5"><div className="flex justify-end"><MoneyCell value={formatCurrency(netSalesGrandTotal)} emphasis="primary" className="text-base" /></div></td>
                  <td className="hidden sm:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
  ring,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  accent: string;
  ring: string;
}) {
  return (
    <Card className="p-4 hover:shadow-soft-md sm:p-5">
      <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl ring-1', accent, ring)}>
        <Icon size={20} />
      </div>
      <p className="mt-3.5 font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{value}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </Card>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof FileText; message: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center text-center">
      <Icon size={32} className="mb-2 text-neutral-300 dark:text-neutral-700" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
