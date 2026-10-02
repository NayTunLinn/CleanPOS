import { useMemo, useRef, useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, X, CheckCircle2, ScanLine, AlertCircle, ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import type { Category, CartItem, Order, PaymentMethod, Product } from '@/lib/types';
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
  const [cartExpanded, setCartExpanded] = useState(false);
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
    setCartExpanded(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden lg:flex-row">
      {/* Product browser */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-border bg-card px-4 pb-3 pt-4 sm:px-6 sm:pt-5">
          <form onSubmit={handleScan} className="mb-3 flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <ScanLine size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
              <input
                ref={scanRef}
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan or type SKU..."
                className="w-full rounded-xl border border-border bg-muted py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="shrink-0">
              <Plus size={16} /> <span className="hidden sm:inline">Add</span>
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
                placeholder="Search products..."
                className="input-search"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/20',
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

        <div className="flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
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
                    'group relative flex flex-col items-center rounded-xl border bg-card p-3 text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/20 sm:p-4',
                    out
                      ? 'cursor-not-allowed border-border opacity-40'
                      : 'border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft-md active:scale-[.97]',
                  )}
                >
                  {inCart && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 min-w-[20px] animate-scale-in items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-soft sm:right-2 sm:top-2 sm:h-6 sm:min-w-[24px] sm:text-xs">
                      {inCart.quantity}
                    </span>
                  )}
                  <span className="mb-1.5 text-3xl transition-transform duration-200 group-hover:scale-110 sm:mb-2 sm:text-4xl">{product.emoji}</span>
                  <p className="text-xs font-bold leading-tight text-foreground sm:text-sm">{product.name}</p>
                  <p className="mt-0.5 text-xs font-extrabold text-primary sm:text-sm sm:mt-1">{formatCurrency(product.price)}</p>
                  <p className={cn('mt-0.5 text-[10px] font-medium sm:text-[11px]', out ? 'text-destructive' : 'text-muted-foreground')}>
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

      {/* Cart — desktop side panel */}
      <div className="hidden w-[380px] shrink-0 flex-col border-l border-border bg-card lg:flex">
        <CartContent
          cart={cart}
          cartCount={cartCount}
          cartSubtotal={cartSubtotal}
          cartTax={cartTax}
          cartTotal={cartTotal}
          payment={payment}
          setPayment={setPayment}
          addToCart={addToCart}
          decrementFromCart={decrementFromCart}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          handleCheckout={handleCheckout}
        />
      </div>

      {/* Cart — mobile bottom sheet */}
      <div className="lg:hidden">
        {/* Slide-up mini bar when collapsed */}
        {!cartExpanded && cart.length > 0 && (
          <button
            onClick={() => setCartExpanded(true)}
            className="fixed bottom-16 left-0 right-0 z-30 flex items-center justify-between border-t border-border bg-card px-4 py-3 shadow-soft-lg"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
                <ShoppingCart size={16} />
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              </div>
              <span className="text-sm font-bold text-foreground">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              View Cart <ChevronUp size={16} />
            </div>
          </button>
        )}

        {/* Expanded bottom sheet */}
        {cartExpanded && (
          <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setCartExpanded(false)}>
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in" />
            <div
              className="absolute bottom-0 left-0 right-0 max-h-[80vh] animate-slide-in-right overflow-y-auto rounded-t-2xl border-t border-border bg-card pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-4 py-3">
                <button
                  onClick={() => setCartExpanded(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                >
                  <ChevronDown size={18} />
                </button>
                <span className="text-sm font-bold text-foreground">Current Order</span>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition hover:text-destructive"
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                )}
              </div>
              <CartContent
                cart={cart}
                cartCount={cartCount}
                cartSubtotal={cartSubtotal}
                cartTax={cartTax}
                cartTotal={cartTotal}
                payment={payment}
                setPayment={setPayment}
                addToCart={addToCart}
                decrementFromCart={decrementFromCart}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
                handleCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </div>

      {lastOrder && (
        <ReceiptModal order={lastOrder} onClose={() => setLastOrder(null)} />
      )}
    </div>
  );
}

function CartContent({
  cart,
  cartCount,
  cartSubtotal,
  cartTax,
  cartTotal,
  payment,
  setPayment,
  addToCart,
  decrementFromCart,
  removeFromCart,
  clearCart,
  handleCheckout,
}: {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  payment: PaymentMethod;
  setPayment: (p: PaymentMethod) => void;
  addToCart: (p: Product) => void;
  decrementFromCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  handleCheckout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="hidden items-center justify-between border-b border-border px-5 py-4 lg:flex">
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

      <div className="flex-1 overflow-y-auto px-4 py-3 lg:px-5 lg:py-4">
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
                className="flex animate-slide-in-right items-center gap-2.5 rounded-xl border border-border bg-muted/50 p-2.5 transition hover:border-primary/30"
              >
                <span className="text-xl sm:text-2xl">{item.product.emoji}</span>
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
                <div className="w-14 text-right sm:w-16">
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

      <div className="border-t border-border px-4 py-3 lg:px-5 lg:py-4">
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

        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
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
  );
}

function ReceiptModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <Card className="w-full max-w-[360px] animate-scale-in p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
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
              <span className="text-left">{item.quantity}× {item.product.name}</span>
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
