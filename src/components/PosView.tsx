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
        <div className="border-b border-border bg-card px-6 pb-4 pt-5">
          <form onSubmit={handleScan} className="mb-3 flex items-center gap-3">
            <div className="relative flex-1">
              <ScanLine size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
              <input
                ref={scanRef}
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan or type SKU (e.g. SNK-001)..."
                className="w-full rounded-xl border border-border bg-muted py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              <Plus size={16} /> Add
            </Button>
          </form>
          {scanError && (
            <div className="mb-3 flex animate-scale-in items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              <AlertCircle size={15} /> {scanError}
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                  'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/20',
                  activeCategory === cat
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto bg-background px-6 py-5">
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
                    'group relative flex flex-col items-center rounded-xl border bg-card p-4 text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/20',
                    out
                      ? 'cursor-not-allowed border-border opacity-40'
                      : 'border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft-md active:scale-[.97]',
                  )}
                >
                  {inCart && (
                    <span className="absolute right-2 top-2 flex h-6 min-w-[24px] animate-scale-in items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground shadow-soft">
                      {inCart.quantity}
                    </span>
                  )}
                  <span className="mb-2 text-4xl transition-transform duration-200 group-hover:scale-110">{product.emoji}</span>
                  <p className="text-sm font-bold leading-tight text-foreground">{product.name}</p>
                  <p className="mt-1 text-sm font-extrabold text-primary">{formatCurrency(product.price)}</p>
                  <p className={cn('mt-0.5 text-[11px] font-medium', out ? 'text-destructive' : 'text-muted-foreground')}>
                    {out ? 'Out of stock' : `${product.stock} left`}
                  </p>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <Search size={32} className="mb-2 text-neutral-300 dark:text-neutral-700" />
              <p className="text-sm font-medium text-muted-foreground">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart panel */}
      <div className="flex w-[380px] flex-col border-l border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">Current Order</h2>
              <p className="text-xs font-medium text-muted-foreground">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground hover:text-destructive">
              <Trash2 size={15} /> Clear
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-neutral-300 dark:text-neutral-700">
                <ShoppingCart size={28} />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Cart is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">Tap products or scan a SKU to start</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex animate-slide-in-right items-center gap-3 rounded-xl border border-border bg-muted/50 p-2.5 transition hover:border-primary/30">
                  <span className="text-2xl">{item.product.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{item.product.name}</p>
                    <p className="text-xs font-medium text-muted-foreground">{formatCurrency(item.product.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => decrementFromCart(item.product.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-sm transition hover:bg-muted active:scale-90"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.product)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-sm transition hover:bg-muted active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="w-16 text-right">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-neutral-300 transition hover:text-destructive dark:text-neutral-600"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax (5%)</span>
              <span className="font-medium">{formatCurrency(cartTax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2.5 text-lg font-extrabold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setPayment('card')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/20',
                payment === 'card'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              <CreditCard size={16} /> Card
            </button>
            <button
              onClick={() => setPayment('cash')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/20',
                payment === 'cash'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:bg-muted',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <Card className="w-[360px] animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-primary dark:bg-brand-950">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="font-display text-lg font-extrabold text-foreground">Payment Complete</h3>
          <p className="text-sm font-medium text-muted-foreground">Order {order.id}</p>
        </div>

        <div className="my-4 space-y-1.5 border-y border-border py-3">
          {order.items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm text-muted-foreground">
              <span>{item.quantity}× {item.product.name}</span>
              <span className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span><span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold text-foreground">
            <span>Total</span><span>{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between pt-1 text-xs text-muted-foreground">
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
