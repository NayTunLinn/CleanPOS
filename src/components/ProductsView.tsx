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
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Products</h1>
          <p className="mt-0.5 text-sm font-medium text-slate-400">
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{products.length}</p>
            <p className="text-xs font-medium text-slate-400">Products</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalStock}</p>
            <p className="text-xs font-medium text-slate-400">Total Stock</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{lowStockCount}</p>
            <p className="text-xs font-medium text-slate-400">Low Stock</p>
          </div>
        </Card>
      </div>

      <div className="mb-5 relative max-w-sm">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
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
              <tr key={p.id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="font-bold text-slate-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant="neutral">{p.category}</Badge>
                </td>
                <td className="px-5 py-3.5 font-mono text-sm text-slate-500">{p.sku}</td>
                <td className="px-5 py-3.5 text-right font-bold text-slate-900">{formatCurrency(p.price)}</td>
                <td className="px-5 py-3.5 text-right">
                  {p.stock === 0 ? (
                    <Badge variant="danger">Out of stock</Badge>
                  ) : p.stock < 15 ? (
                    <Badge variant="warning">{p.stock} left</Badge>
                  ) : (
                    <span className="text-sm font-semibold text-slate-600">{p.stock}</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
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
            <Package size={28} className="mb-2 text-slate-200" />
            <p className="text-sm font-medium text-slate-400">No products found</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <Card className="w-[380px] animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <Trash2 size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Product</h3>
            <p className="text-xs font-medium text-slate-400">This action cannot be undone</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-slate-600">
          Are you sure you want to delete <span className="font-bold text-slate-900">{product.emoji} {product.name}</span>? It will be removed from your catalog permanently.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <Card className="w-[460px] max-h-[90vh] animate-scale-in overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Package size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {product ? 'Edit Product' : 'New Product'}
            </h3>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-all duration-150',
                    emoji === e ? 'bg-slate-900 ring-2 ring-slate-900 ring-offset-1 scale-110' : 'bg-slate-100 hover:bg-slate-200',
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Flat White"
              className="input-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Price (Ks)</label>
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">Stock</label>
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
            <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    'rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200',
                    category === c
                      ? 'bg-slate-900 text-white shadow-soft'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">SKU (optional)</label>
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
