import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Package, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import type { Category, Product } from '@/lib/types';
import { Button, Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

const CATEGORIES: Category[] = ['Snacks', 'Beverages', 'Grocery', 'Household'];
const EMOJIS = ['🥔', '🍫', '🥨', '🍿', '🍪', '🥜', '🥤', '🧃', '💧', '⚡', '🥛', '☕', '🍞', '🥚', '🍚', '🍝', '🫘', '🍌', '🪥', '🧼', '🧻', '🧴', '🗑️', '🔋'];

export function ProductsView() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search],
  );

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setShowForm(true);
  };

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock < 15).length;

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">Products</h1>
          <p className="mt-0.5 text-sm font-medium text-muted-foreground">
            {products.length} items in catalog · {totalStock} total stock
          </p>
        </div>
        <Button onClick={openNew} variant="primary">
          <Plus size={18} /> Add Product
        </Button>
      </div>

      {/* Mini stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Package size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-extrabold text-foreground">{products.length}</p>
            <p className="text-xs font-medium text-muted-foreground">Products</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-primary dark:bg-brand-950">
            <Package size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-extrabold text-foreground">{totalStock}</p>
            <p className="text-xs font-medium text-muted-foreground">Total Stock</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-extrabold text-foreground">{lowStockCount}</p>
            <p className="text-xs font-medium text-muted-foreground">Low Stock</p>
          </div>
        </Card>
      </div>

      <div className="mb-5 relative max-w-sm">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-search"
        />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3.5">Product</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">SKU</th>
              <th className="px-5 py-3.5 text-right">Price</th>
              <th className="px-5 py-3.5 text-right">Stock</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/50 transition hover:bg-muted/30">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="font-bold text-foreground">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant="neutral">{p.category}</Badge>
                </td>
                <td className="px-5 py-3.5 font-mono text-sm text-muted-foreground">{p.sku}</td>
                <td className="px-5 py-3.5 text-right font-bold text-foreground">{formatCurrency(p.price)}</td>
                <td className="px-5 py-3.5 text-right">
                  {p.stock === 0 ? (
                    <Badge variant="danger">Out of stock</Badge>
                  ) : p.stock < 15 ? (
                    <Badge variant="warning">{p.stock} left</Badge>
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">{p.stock}</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <Package size={28} className="mb-2 text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-medium text-muted-foreground">No products found</p>
          </div>
        )}
      </Card>

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => setShowForm(false)}
          onSave={(product) => {
            if (editing) updateProduct(product);
            else addProduct(product);
            setShowForm(false);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
          onConfirm={() => {
            deleteProduct(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function DeleteConfirm({
  product,
  onConfirm,
  onCancel,
}: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <Card className="w-[380px] animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Trash2 size={22} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Delete Product</h3>
            <p className="text-xs font-medium text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-bold text-foreground">{product.emoji} {product.name}</span>? It will be removed from your catalog permanently.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            <Trash2 size={16} /> Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ProductForm({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price.toString() ?? '');
  const [category, setCategory] = useState<Category>(product?.category ?? 'Snacks');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [stock, setStock] = useState(product?.stock.toString() ?? '');
  const [emoji, setEmoji] = useState(product?.emoji ?? '☕');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);
    if (!name || isNaN(priceNum) || isNaN(stockNum)) return;

    onSave({
      id: product?.id ?? `p${Date.now()}`,
      name,
      price: priceNum,
      category,
      sku: sku || `${category.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      stock: stockNum,
      emoji,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <Card className="w-[460px] max-h-[90vh] animate-scale-in overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Package size={18} />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {product ? 'Edit Product' : 'New Product'}
            </h3>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-all duration-150',
                    emoji === e
                      ? 'bg-foreground ring-2 ring-foreground ring-offset-1 ring-offset-card scale-110 text-background'
                      : 'bg-muted hover:bg-muted/80',
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Flat White"
              className="input-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Price (Ks)</label>
              <input
                type="number"
                step="100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    'rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200',
                    category === c
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">SKU (optional)</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Auto-generated"
              className="input-base font-mono"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">{product ? 'Save Changes' : 'Add Product'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
