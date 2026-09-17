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
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Orders</h1>
        <p className="mt-0.5 text-sm font-medium text-slate-400">
          {orders.length} completed orders · {formatCurrency(totalRevenue)} total
        </p>
      </div>

      <div className="mb-5 relative max-w-sm">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID..."
          className="input-search"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="flex h-48 flex-col items-center justify-center">
          <Receipt size={32} className="mb-2 text-slate-200" />
          <p className="text-sm font-medium text-slate-400">No orders found</p>
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
      className={cn('animate-fade-in-up overflow-hidden transition-all', isExpanded && 'ring-1 ring-brand-200 shadow-soft-md')}
      style={{ animationDelay }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left transition hover:bg-slate-50/50"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Receipt size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900">{order.id}</span>
              <Badge variant="success">{order.status}</Badge>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-400">
              {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-extrabold text-slate-900">{formatCurrency(order.total)}</p>
            <p className="text-xs font-medium capitalize text-slate-400">{itemCount} items · {order.paymentMethod}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="animate-fade-in border-t border-slate-100 bg-slate-50/30 p-4">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 transition hover:border-slate-200">
                <span className="text-xl">{item.product.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{item.product.name}</p>
                  <p className="text-xs font-medium text-slate-400">
                    {item.quantity} × {formatCurrency(item.product.price)}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span><span className="font-medium">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-extrabold text-slate-900">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <Card className="w-[480px] max-h-[90vh] animate-scale-in overflow-y-auto p-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <FileText size={16} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Invoice</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              title="Print"
            >
              <Printer size={17} />
            </button>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice header */}
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft shadow-brand-500/20">
              <Store size={22} />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">MiniMart</p>
              <p className="text-xs font-medium text-slate-400">123 Main Street · Yangon, Myanmar · Tel: (555) 010-2030</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Order ID</p>
              <p className="font-bold text-slate-900">{order.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</p>
              <span className="badge bg-brand-50 text-brand-700 capitalize">{order.status}</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date</p>
              <p className="font-bold text-slate-900">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Time</p>
              <p className="font-bold text-slate-900">{formatTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment</p>
              <p className="font-bold capitalize text-slate-900">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cashier</p>
              <p className="font-bold text-slate-900">Alex Morgan</p>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="px-6 py-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-2.5">Item</th>
                <th className="pb-2.5 text-center">Qty</th>
                <th className="pb-2.5 text-right">Price</th>
                <th className="pb-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.product.id} className="border-b border-slate-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{item.product.emoji}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.product.name}</p>
                        <p className="font-mono text-[11px] text-slate-400">{item.product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center text-sm font-semibold text-slate-600">{item.quantity}</td>
                  <td className="py-3 text-right text-sm font-medium text-slate-600">{formatCurrency(item.product.price)}</td>
                  <td className="py-3 text-right text-sm font-bold text-slate-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="ml-auto max-w-[240px] space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Items</span><span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span><span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Tax (5%)</span><span className="font-medium">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-900">
              <span>Total</span><span>{formatCurrency(order.total)}</span>
            </div>
          </div>
          <p className="mt-5 text-center text-xs font-medium text-slate-400">Thank you for shopping at MiniMart!</p>
        </div>
      </Card>
    </div>
  );
}
