import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, BarChart3, ShoppingBag } from 'lucide-react';
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
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-950 to-brand-950/40" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent-500/5 blur-3xl" />

        <div className="relative z-10">
          <picture className="block h-20 w-72">
            <img src="/assets/logos/minimartLight.png" alt="MiniMart" className="h-full w-full object-contain" />
          </picture>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white">
              Run your store<br />with confidence.
            </h1>
            <p className="mt-4 max-w-md text-base text-neutral-400">
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
                    <p className="text-xs text-neutral-400">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-neutral-500">
          <Zap size={14} className="text-brand-400" />
          <span>Powered by MiniMart POS · v2.0</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-[400px] animate-fade-in-up">
          <div className="mb-8 lg:hidden">
            <picture className="mb-4 block h-14 w-52">
              <img src="/assets/logos/minimartLight.png" alt="MiniMart" className="h-full w-full object-contain dark:hidden" />
              <img src="/assets/logos/minimartDark.png" alt="MiniMart" className="hidden h-full w-full object-contain dark:block" />
            </picture>
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                <label className="block text-sm font-semibold text-foreground">Password</label>
                <span className="text-xs text-muted-foreground">minimart123</span>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="animate-scale-in rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Demo Access
            </p>
            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => fillDemo(demo.email)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition-all duration-200 hover:border-primary/40 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/20 outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                      {demo.name.split(' ').map((w) => w[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{demo.label}</p>
                      <p className="text-xs text-muted-foreground">{demo.email}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground transition',
                  )}>
                    Use
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            This is a demo. No real authentication is performed.
          </p>
        </div>
      </div>
    </div>
  );
}
