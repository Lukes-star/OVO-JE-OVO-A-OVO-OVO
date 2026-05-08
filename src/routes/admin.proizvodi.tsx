import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Package, Edit, Trash2, Search } from "lucide-react";
import { formatRSD } from "@/lib/cart";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/admin/proizvodi")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const del = async (id: string) => {
    if (!confirm("Obrisati proizvod?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Obrisano"); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
  };

  const products = (data ?? []).filter((p: any) =>
    !q || p.name?.toLowerCase().includes(q.toLowerCase()) || p.category?.toLowerCase().includes(q.toLowerCase()) || p.car_model?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="anim-fade-up">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Proizvodi</h1>
          <p className="text-muted-foreground text-sm mt-1">Ukupno {(data ?? []).length} proizvoda</p>
        </div>
        <Link to="/admin/dodaj"
          className="inline-flex items-center gap-2 bg-gold text-gold-foreground px-4 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> Dodaj
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Pretraži proizvode..."
          className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm outline-none focus:border-gold transition placeholder:text-muted-foreground" />
      </div>

      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-muted-foreground text-sm">Učitavanje...</div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-30" />
            <p className="font-semibold text-sm">{q ? "Nema rezultata" : "Nema proizvoda"}</p>
            {!q && (
              <Link to="/admin/dodaj" className="mt-4 inline-flex items-center gap-2 bg-gold text-gold-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition">
                <Plus className="h-4 w-4" /> Dodaj prvi proizvod
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  {["Proizvod", "Kategorija", "Model", "Cena", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p: any, i: number) => (
                  <tr key={p.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition group anim-fade-up"
                    style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/8 shrink-0 flex items-center justify-center">
                          {p.image_url
                            ? <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                            : <Package className="h-4 w-4 text-muted-foreground opacity-40" />}
                        </div>
                        <span className="font-semibold line-clamp-2 max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.category || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.car_model || "—"}</td>
                    <td className="px-4 py-3 font-black text-gold">{formatRSD(Number(p.price))}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${p.in_stock ? "bg-green-400/15 text-green-400 border-green-400/25" : "bg-neutral-500/15 text-neutral-400 border-neutral-500/25"}`}>
                        {p.in_stock ? "Na stanju" : "Nema"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                        <Link to="/admin/dodaj" search={{ id: p.id } as any}
                          className="p-2 hover:bg-white/8 rounded-lg transition text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button onClick={() => del(p.id)}
                          className="p-2 hover:bg-red-500/15 rounded-lg transition text-muted-foreground hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
