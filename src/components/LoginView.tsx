import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Store, ArrowRight, ShieldCheck, Zap, BarChart3, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const DEMO_ACCOUNTS = [
  { email: 'cashier@minimart.mm', label: 'Cashier', name: 'Alex Morgan' },
  { email: 'admin@minimart.mm', label: 'Manager', name: 'Sarah Lee' },
];

const FEATURES = [
  { icon: ShoppingBag, title: 'Fast Checkout', desc: 'Scan, tap, and charge in seconds' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time sales and inventory data' },
  { icon: ShieldCheck, title: 'Secure & Reliable', desc: 'Built for daily retail operations' },
];

export function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setError('Invalid email or password. Try the demo accounts below.');
      }
      setLoading(false);
    }, 400);
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('minimart123');
    setError('');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-900 p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-brand-950/60" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent-500/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
              <Store size={24} />
            </div>
            <div>
              <p className="text-lg font-bold text-white">MiniMart</p>
              <p className="text-xs text-slate-400">Point of Sale System</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight text-white">
              Run your store<br />with confidence.
            </h1>
            <p className="mt-4 max-w-md text-base text-slate-400">
              Complete POS solution with checkout, inventory, sales reporting,
              and real-time analytics — all in one beautiful interface.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-brand-400 ring-1 ring-white/10">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-slate-400">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <Zap size={14} className="text-brand-400" />
          <span>Powered by MiniMart POS · v2.0</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-6 py-12 dark:bg-zinc-950 lg:w-1/2">
        <div className="w-full max-w-[400px] animate-fade-in-up">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg">
              <Store size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">MiniMart</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Point of Sale System</p>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-300">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cashier@minimart.mm"
                  className="input-base pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">Password</label>
                <span className="text-xs text-slate-400 dark:text-zinc-500">minimart123</span>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-base pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-100 dark:bg-red-950 dark:text-red-400 dark:ring-red-900">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-zinc-800">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Quick Demo Access
            </p>
            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => fillDemo(demo.email)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-all duration-200 hover:border-brand-300 hover:bg-brand-50/30 hover:shadow-soft dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {demo.name.split(' ').map((w) => w[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{demo.label}</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">{demo.email}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 transition dark:bg-zinc-800 dark:text-zinc-300',
                  )}>
                    Use
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 dark:text-zinc-500">
            This is a demo. No real authentication is performed.
          </p>
        </div>
      </div>
    </div>
  );
}
