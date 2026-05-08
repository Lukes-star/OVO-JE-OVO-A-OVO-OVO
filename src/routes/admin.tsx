import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { LayoutDashboard, ShoppingCart, Package, Plus, LogOut, Tag, ChevronRight, ExternalLink, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin")({ component: Layout });

const NAV = [
  { to: "/admin",            label: "Dashboard",      icon: LayoutDashboard, exact: true },
  { to: "/admin/porudzbine", label: "Porudžbine",     icon: ShoppingCart },
  { to: "/admin/proizvodi",  label: "Proizvodi",      icon: Package },
  { to: "/admin/dodaj",      label: "Dodaj Proizvod", icon: Plus },
  { to: "/admin/kategorije", label: "Kategorije",     icon: Tag },
];

function Layout() {
  const { session, isAdmin, loading } = useAdminAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { if (!loading && !session) nav({ to: "/admin/login" }); }, [loading, session, nav]);

  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Učitavanje...</p>
      </div>
    </div>
  );
  if (!session) return null;
  if (!isAdmin) return (
    <div className="min-h-screen bg-[#080808] text-foreground flex flex-col items-center justify-center gap-4">
      <p>Nalog nema admin pristup.</p>
      <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/admin/login" }); }} className="bg-gold text-gold-foreground px-4 py-2 rounded-xl font-bold">Odjavi se</button>
    </div>
  );

  const isActive = (to: string, exact?: boolean) => exact ? loc.pathname === to : loc.pathname.startsWith(to) && !(exact === false && loc.pathname === "/admin");

  const Sidebar = () => (
    <aside className="h-full flex flex-col bg-[#0c0c0c] border-r border-white/5">
      {/* Logo */}
      <div className="p-5 border-b border-white/5 flex items-center gap-3">
        <div className="bg-white rounded-lg p-1.5 shrink-0">
          <img src={logo} alt="" className="h-8 w-8 object-contain" />
        </div>
        <div>
          <p className="font-black tracking-wider text-gold text-sm">CAR-TECH RS</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Menu</p>
        {NAV.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? loc.pathname === to : loc.pathname.startsWith(to);
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${active
                ? "bg-gold/15 text-gold border border-gold/25"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"}`}>
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-gold" : "group-hover:text-gold/70"} transition-colors`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3 w-3 text-gold/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 space-y-1.5">
        <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition">
          <ExternalLink className="h-3.5 w-3.5" /> Otvori Sajt
        </Link>
        <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/admin/login" }); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-destructive/10 hover:text-red-400 transition">
          <LogOut className="h-3.5 w-3.5" /> Odjava
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-foreground flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 shrink-0 flex-col fixed top-0 left-0 h-full z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 flex flex-col"><Sidebar /></div>
          <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-1.5">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="md:hidden sticky top-0 z-40 bg-[#0c0c0c]/90 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5">
            <Menu className="h-4 w-4" />
          </button>
          <span className="font-black text-gold text-sm tracking-wider">CAR-TECH RS</span>
        </div>
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
