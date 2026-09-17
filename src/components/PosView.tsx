import { useMemo, useRef, useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, X, CheckCircle2, ScanLine, AlertCircle, ShoppingCart } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import type { Category, Order, PaymentMethod } from '@/lib/types';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';

const CATEGORIES: (Category | 'All')[] = ['All', 'Snacks', 'Beverages', 'Grocery', 'Household'];

export function PosView() {
  const {
    products,
    cart,
    addToCart,
    decrementFromCart,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    cartCount,
    checkout,
  } = useStore();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [scanError, setScanError] = useState('');
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scanRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = scanInput.trim();
    if (!code) return;

    const product = products.find((p) => p.sku.toLowerCase() === code.toLowerCase());
    if (product) {
      if (product.stock === 0) {
        setScanError(`"${product.name}" is out of stock`);
      } else {
        addToCart(product);
        setScanError('');
      }
    } else {
      setScanError(`No product found for "${code}"`);
    }
    setScanInput('');
    scanRef.current?.focus();
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const order = checkout(payment);
    setLastOrder(order);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with scanner + search */}
        <div className="border-b border-slate-200/70 bg-white px-6 pb-4 pt-5">
          <form onSubmit={handleScan} className="mb-3 flex items-center gap-3">
            <div className="relative flex-1">
              <ScanLine size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" />
              <input
                ref={scanRef}
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan or type SKU (e.g. SNK-001)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:shadow-glow-brand"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              <Plus size={16} /> Add
            </Button>
          </form>
          {scanError && (
            <div className="mb-3 flex animate-scale-in items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              <AlertCircle size={15} /> {scanError}
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name..."
                className="input-search"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-soft'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((product) => {
              const inCart = cart.find((i) => i.product.id === product.id);
              const out = product.stock === 0;
              return (
                <button
                  key={product.id}
                  disabled={out}
                  onClick={() => {
                    addToCart(product);
                    setScanError('');
                  }}
                  className={cn(
                    'group relative flex flex-col items-center rounded-2xl border bg-white p-4 text-center transition-all duration-200',
                    out
                      ? 'cursor-not-allowed border-slate-100 opacity-40'
                      : 'border-slate-200/70 shadow-soft hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft-md active:scale-[.97]',
                  )}
                >
                  {inCart && (
                    <span className="absolute right-2 top-2 flex h-6 min-w-[24px] animate-scale-in items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white shadow-sm">
                      {inCart.quantity}
                    </span>
                  )}
                  <span className="mb-2 text-4xl transition-transform duration-200 group-hover:scale-110">{product.emoji}</span>
                  <p className="text-sm font-bold leading-tight text-slate-900">{product.name}</p>
                  <p className="mt-1 text-sm font-extrabold text-brand-600">{formatCurrency(product.price)}</p>
                  <p className={cn('mt-0.5 text-[11px] font-medium', out ? 'text-red-500' : 'text-slate-400')}>
                    {out ? 'Out of stock' : `${product.stock} left`}
                  </p>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <Search size={32} className="mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-400">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart panel */}
      <div className="flex w-[380px] flex-col border-l border-slate-200/70 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Current Order</h2>
              <p className="text-xs font-medium text-slate-400">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-slate-400 hover:text-red-500">
              <Trash2 size={15} /> Clear
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                <ShoppingCart size={28} />
              </div>
              <p className="text-sm font-semibold text-slate-400">Cart is empty</p>
              <p className="mt-1 text-xs text-slate-400">Tap products or scan a SKU to start</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex animate-slide-in-right items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 transition hover:border-slate-200"
                >
                  <span className="text-2xl">{item.product.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{item.product.name}</p>
                    <p className="text-xs font-medium text-slate-400">{formatCurrency(item.product.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => decrementFromCart(item.product.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 active:scale-90"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.product)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="w-16 text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-300 transition hover:text-red-500"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200/70 px-5 py-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Tax (5%)</span>
              <span className="font-medium">{formatCurrency(cartTax)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2.5 text-lg font-extrabold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setPayment('card')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-200',
                payment === 'card'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-soft'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50',
              )}
            >
              <CreditCard size={16} /> Card
            </button>
            <button
              onClick={() => setPayment('cash')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-200',
                payment === 'cash'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-soft'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50',
              )}
            >
              <Banknote size={16} /> Cash
            </button>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            variant="success"
            size="lg"
            className="mt-3 w-full"
          >
            Charge {formatCurrency(cartTotal)}
          </Button>
        </div>
      </div>

      {lastOrder && (
        <ReceiptModal order={lastOrder} onClose={() => setLastOrder(null)} />
      )}
    </div>
  );
}

function ReceiptModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <Card className="w-[360px] animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">Payment Complete</h3>
          <p className="text-sm font-medium text-slate-400">Order {order.id}</p>
        </div>

        <div className="my-4 space-y-1.5 border-y border-slate-100 py-3">
          {order.items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm text-slate-600">
              <span>{item.quantity}× {item.product.name}</span>
              <span className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Tax</span><span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-extrabold text-slate-900">
            <span>Total</span><span>{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between pt-1 text-xs text-slate-400">
            <span>Paid via</span><span className="font-medium capitalize">{order.paymentMethod}</span>
          </div>
        </div>

        <Button onClick={onClose} className="mt-5 w-full">
          New Order
        </Button>
      </Card>
    </div>
  );
}
