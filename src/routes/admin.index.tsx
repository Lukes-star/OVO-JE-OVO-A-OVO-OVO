import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Clock, Package, TrendingUp, ArrowRight, ChevronRight } from "lucide-react";
import { formatRSD } from "@/lib/cart";

export const Route = createFileRoute("/admin/")({ component: Page });

function Page() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const orders = data ?? [];
  const total   = orders.length;
  const pending = orders.filter((o: any) => o.status === "na_cekanju").length;
  const sent    = orders.filter((o: any) => o.status === "poslato" || o.status === "isporuceno").length;
  const revenue = orders.filter((o: any) => o.status !== "otkazano").reduce((s: number, o: any) => s + Number(o.total), 0);

  const stats = [
    { icon: ShoppingCart, title: "Ukupno porudžbina", value: total,          sub: "svih vremena",      color: "text-blue-400",  bg: "bg-blue-400/10",  border: "border-blue-400/20" },
    { icon: Clock,        title: "Čeka obradu",       value: pending,         sub: "zahteva pažnju",    color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    { icon: Package,      title: "Poslato/Isporuceno", value: sent,            sub: "uspešno",           color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
    { icon: TrendingUp,   title: "Ukupna zarada",     value: formatRSD(revenue), sub: "bez otkazanih",  color: "text-gold",      bg: "bg-gold/10",      border: "border-gold/20" },
  ];

  return (
    <div className="anim-fade-up max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Pregled poslovanja</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, title, value, sub, color, bg, border }, i) => (
          <div key={title} className={`bg-white/[0.03] border ${border} rounded-2xl p-5 anim-fade-up hover:bg-white/[0.05] transition-all`}
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${bg} mb-4`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-sm font-semibold mt-0.5">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden anim-fade-up delay-300" style={{ animationFillMode: "both" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-black text-base">Poslednje Porudžbine</h2>
          <Link to="/admin/porudzbine" className="flex items-center gap-1 text-xs text-gold hover:underline font-semibold">
            Sve <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nema porudžbina</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.slice(0, 6).map((o: any, i: number) => (
              <div key={o.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition anim-fade-up"
                style={{ animationDelay: `${(i + 4) * 50}ms`, animationFillMode: "both" }}>
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <span className="text-gold text-xs font-black">{o.customer_name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.city} · {new Date(o.created_at).toLocaleDateString("sr-RS")}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-sm text-gold">{formatRSD(Number(o.total))}</p>
                  <StatusBadge s={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
        {orders.length > 6 && (
          <div className="px-6 py-3 border-t border-white/5">
            <Link to="/admin/porudzbine" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-gold transition font-semibold">
              Vidi sve porudžbine <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ s }: { s: string }) {
  const m: Record<string, string> = {
    na_cekanju: "bg-amber-400/15 text-amber-400 border-amber-400/25",
    poslato:    "bg-blue-400/15 text-blue-400 border-blue-400/25",
    isporuceno: "bg-green-400/15 text-green-400 border-green-400/25",
    otkazano:   "bg-neutral-500/15 text-neutral-400 border-neutral-500/25",
  };
  const l: Record<string, string> = { na_cekanju: "Na čekanju", poslato: "Poslato", isporuceno: "Isporučeno", otkazano: "Otkazano" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${m[s] ?? "bg-neutral-500/15 text-neutral-400 border-neutral-500/25"}`}>{l[s] ?? s}</span>;
}
