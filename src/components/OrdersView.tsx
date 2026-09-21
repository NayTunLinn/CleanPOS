import { useState } from 'react';
import { ChevronDown, ChevronUp, Receipt, Search, FileText, X, Store, Printer } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { Button, Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Order } from '@/lib/types';

export function OrdersView() {
  const { orders } = useStore();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const filtered = orders.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()),
  );

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mb-7">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">Orders</h1>
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">
          {orders.length} completed orders · {formatCurrency(totalRevenue)} total
        </p>
      </div>

      <div className="mb-5 relative max-w-sm">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID..."
          className="input-search"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="flex h-48 flex-col items-center justify-center">
          <Receipt size={32} className="mb-2 text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm font-medium text-muted-foreground">No orders found</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((order, idx) => (
            <OrderRow
              key={order.id}
              order={order}
              isExpanded={expanded === order.id}
              onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
              onViewInvoice={() => setInvoiceOrder(order)}
              animationDelay={`${idx * 30}ms`}
            />
          ))}
        </div>
      )}

      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}
    </div>
  );
}

function OrderRow({
  order,
  isExpanded,
  onToggle,
  onViewInvoice,
  animationDelay,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onViewInvoice: () => void;
  animationDelay: string;
}) {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Card
      className={cn('animate-fade-in-up overflow-hidden transition-all', isExpanded && 'ring-1 ring-primary/30 shadow-soft-md')}
      style={{ animationDelay }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left transition hover:bg-muted/40"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Receipt size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-foreground">{order.id}</span>
              <Badge variant="success">{order.status}</Badge>
            </div>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-extrabold text-foreground">{formatCurrency(order.total)}</p>
            <p className="text-xs font-medium capitalize text-muted-foreground">{itemCount} items · {order.paymentMethod}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="animate-fade-in border-t border-border bg-muted/20 p-4">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 transition hover:border-primary/30">
                <span className="text-xl">{item.product.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{item.product.name}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.product.price)}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span><span className="font-medium">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between pt-1 font-display text-base font-extrabold text-foreground">
              <span>Total</span><span>{formatCurrency(order.total)}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="primary" size="sm" onClick={onViewInvoice}>
              <FileText size={15} /> View Invoice
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <Card className="w-[480px] max-h-[90vh] animate-scale-in overflow-y-auto p-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <FileText size={16} />
            </div>
            <h3 className="font-display text-base font-bold text-foreground">Invoice</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Print"
            >
              <Printer size={17} />
            </button>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice header */}
        <div className="border-b border-border px-6 py-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
              <Store size={22} />
            </div>
            <div>
              <p className="font-display text-lg font-extrabold text-foreground">MiniMart</p>
              <p className="text-xs font-medium text-muted-foreground">123 Main Street · Yangon, Myanmar · Tel: (555) 010-2030</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 rounded-xl border border-border bg-muted/50 p-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order ID</p>
              <p className="font-bold text-foreground">{order.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
              <span className="badge bg-brand-50 text-brand-700 capitalize dark:bg-brand-950 dark:text-brand-300">{order.status}</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
              <p className="font-bold text-foreground">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</p>
              <p className="font-bold text-foreground">{formatTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment</p>
              <p className="font-bold capitalize text-foreground">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cashier</p>
              <p className="font-bold text-foreground">Alex Morgan</p>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="px-6 py-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-2.5">Item</th>
                <th className="pb-2.5 text-center">Qty</th>
                <th className="pb-2.5 text-right">Price</th>
                <th className="pb-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.product.id} className="border-b border-border/50">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{item.product.emoji}</span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.product.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{item.product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center text-sm font-semibold text-muted-foreground">{item.quantity}</td>
                  <td className="py-3 text-right text-sm font-medium text-muted-foreground">{formatCurrency(item.product.price)}</td>
                  <td className="py-3 text-right text-sm font-bold text-foreground">
                    {formatCurrency(item.product.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-border bg-muted/30 px-6 py-5">
          <div className="ml-auto max-w-[240px] space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Items</span><span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span><span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax (5%)</span><span className="font-medium">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-display text-base font-extrabold text-foreground">
              <span>Total</span><span>{formatCurrency(order.total)}</span>
            </div>
          </div>
          <p className="mt-5 text-center text-xs font-medium text-muted-foreground">Thank you for shopping at MiniMart!</p>
        </div>
      </Card>
    </div>
  );
}
