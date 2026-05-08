import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { useCategories } from "@/lib/categories";
import { CAR_BRANDS, BRAND_LOGOS } from "@/lib/carBrands";
import { ArrowLeft, Filter, X, Search } from "lucide-react";
import { useState } from "react";

type Search = { q?: string; kat?: string; brand?: string };

export const Route = createFileRoute("/proizvodi")({
  component: Page,
  validateSearch: (s: Record<string, unknown>): Search => ({
    q:     typeof s.q     === "string" ? s.q     : undefined,
    kat:   typeof s.kat   === "string" ? s.kat   : undefined,
    brand: typeof s.brand === "string" ? s.brand : undefined,
  }),
});

function BrandLogo({ brand, size = 48 }: { brand: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-gold font-black text-2xl">{brand[0]}</span>
    </div>
  );
  return (
    <img
      src={BRAND_LOGOS[brand as keyof typeof BRAND_LOGOS]}
      alt={brand}
      style={{ width: size, height: size }}
      className="object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(201,162,39,0.7)]"
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}

function Page() {
  const { q, kat, brand } = Route.useSearch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: categories = [] } = useCategories();

  const { data, isLoading } = useQuery({
    queryKey: ["products", q, kat, brand],
    queryFn: async () => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (kat)   query = query.eq("category", kat);
      if (q)     query = query.ilike("name", `%${q}%`);
      if (brand) query = query.ilike("car_model", `%${brand}%`);
      const { data } = await query;
      return data ?? [];
    },
  });

  const { data: brandCounts } = useQuery({
    queryKey: ["brand-counts", kat],
    queryFn: async () => {
      let query = supabase.from("products").select("car_model");
      if (kat) query = query.eq("category", kat);
      const { data } = await query;
      const counts: Record<string, number> = {};
      (data ?? []).forEach((p: any) => {
        const cm = (p.car_model ?? "").toUpperCase();
        for (const b of CAR_BRANDS) {
          if (cm.includes(b)) counts[b] = (counts[b] ?? 0) + 1;
        }
      });
      return counts;
    },
  });

  const showBrandPicker = !!kat && !brand && !q;

  const SidebarContent = (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 px-3">Kategorije</p>
      <div className="flex flex-col gap-0.5">
        <Link to="/proizvodi" search={{} as any} onClick={() => setSidebarOpen(false)}
          className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${!kat ? "bg-gold/15 text-gold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
          Sve
        </Link>
        {categories.map(c => (
          <Link key={c} to="/proizvodi" search={{ kat: c } as any} onClick={() => setSidebarOpen(false)}
            className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${kat === c ? "bg-gold/15 text-gold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
            {c}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">

        {/* Mobile top bar */}
        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 border border-border bg-card/60 backdrop-blur px-3 py-2 rounded-xl text-sm font-semibold">
            <Filter className="h-4 w-4" />
            {kat ? <span className="text-gold max-w-[110px] truncate">{kat}</span> : "Kategorije"}
          </button>
          {(kat || brand) && (
            <Link to="/proizvodi" search={{} as any}
              className="flex items-center gap-1 text-xs text-muted-foreground border border-border bg-card/40 px-2.5 py-2 rounded-xl hover:text-gold transition">
              <X className="h-3.5 w-3.5" /> Reset
            </Link>
          )}
          <div className="ml-auto text-xs text-muted-foreground font-semibold">
            {!showBrandPicker && `${data?.length ?? 0} rez.`}
          </div>
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="bg-[#0c0c0c]/95 backdrop-blur border-r border-border w-72 p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <span className="font-black text-base">Filter</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl border border-border hover:bg-white/5">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {SidebarContent}
            </div>
            <div className="flex-1 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        <div className="grid lg:grid-cols-[220px_1fr] gap-6 md:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block sticky top-24 h-fit">
            {SidebarContent}
          </aside>

          <div>
            {/* Title */}
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              {brand && kat && (
                <Link to="/proizvodi" search={{ kat } as any}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold transition">
                  <ArrowLeft className="h-4 w-4" /> Sve marke
                </Link>
              )}
              <h1 className="text-xl md:text-3xl font-black">
                {brand ? `${brand}${kat ? ` — ${kat}` : ""}` : kat || "Svi proizvodi"}
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mb-5">
              {showBrandPicker ? "Izaberite marku vozila" : `${data?.length ?? 0} proizvoda${q ? ` za "${q}"` : ""}`}
            </p>

            {showBrandPicker ? (
              <BrandPicker kat={kat!} counts={brandCounts ?? {}} />
            ) : isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : data && data.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {data.map((p: any, i: number) => (
                  <div key={p.id} className="anim-fade-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}>
                    <ProductCard p={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Nema proizvoda{brand ? ` za ${brand}` : ""}.</p>
                <Link to="/proizvodi" search={{} as any} className="mt-3 inline-block text-gold hover:underline text-sm">
                  Prikaži sve →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function BrandPicker({ kat, counts }: { kat: string; counts: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
      {CAR_BRANDS.map((b, i) => {
        const count = counts[b] ?? 0;
        return (
          <Link key={b} to="/proizvodi" search={{ kat, brand: b } as any}
            className="group relative bg-card/60 backdrop-blur border border-border rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-gold hover:bg-gold/8 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10 anim-fade-up"
            style={{ animationDelay: `${i * 35}ms`, animationFillMode: "both" }}>

            {/* Gold ring on hover */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-gold/0 group-hover:ring-gold/25 transition-all duration-300" />

            {/* Logo */}
            <div className="w-14 h-14 md:w-16 md:h-16 mb-3 flex items-center justify-center">
              <BrandLogo brand={b} size={52} />
            </div>

            <span className="font-black uppercase tracking-wider text-xs md:text-sm group-hover:text-gold transition-colors">
              {b}
            </span>

            <span className={`text-[10px] mt-1 font-semibold ${count > 0 ? "text-gold/70" : "text-muted-foreground"}`}>
              {count} {count === 1 ? "proizvod" : "proizvoda"}
            </span>

            {count > 0 && (
              <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-gold animate-pulse" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
