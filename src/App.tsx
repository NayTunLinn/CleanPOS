import { useState } from 'react';
import { StoreProvider } from '@/lib/store';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { Sidebar, type View } from '@/components/Sidebar';
import { PosView } from '@/components/PosView';
import { DashboardView } from '@/components/DashboardView';
import { ProductsView } from '@/components/ProductsView';
import { OrdersView } from '@/components/OrdersView';
import { SalesView } from '@/components/SalesView';
import { LoginView } from '@/components/LoginView';

function AppContent() {
  const { user } = useAuth();
  const [view, setView] = useState<View>('pos');

  if (!user) return <LoginView />;

  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <Sidebar view={view} onNavigate={setView} />
        <main className="flex-1 overflow-hidden">
          {view === 'pos' && <PosView />}
          {view === 'dashboard' && <DashboardView />}
          {view === 'products' && <ProductsView />}
          {view === 'orders' && <OrdersView />}
          {view === 'sales' && <SalesView />}
        </main>
      </div>
    </StoreProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
