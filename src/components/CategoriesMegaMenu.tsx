import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, X, LayoutGrid } from "lucide-react";
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_IMAGES } from "@/lib/categories";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Props = { onClose?: () => void; drawer?: boolean };

export function CategoriesMegaMenu({ onClose, drawer }: Props) {
  const [active, setActive] = useState<string>(CATEGORIES[0]);
  const { data: products } = useQuery({
    queryKey: ["products-all-min"],
    queryFn: async () => { const { data } = await supabase.from("products").select("category, car_model"); return data ?? []; },
  });
  const modelsByCategory = useMemo(() => {
    const map: Record<string,Record<string,number>> = {};
    for (const c of CATEGORIES) map[c] = {};
    (products??[]).forEach((p:any)=>{ if(!p.category||!p.car_model)return; map[p.category]=map[p.category]||{}; map[p.category][p.car_model]=(map[p.category][p.car_model]??0)+1; });
    return map;
  }, [products]);
  const countByCategory = useMemo(() => {
    const c: Record<string,number> = {}; for(const k of CATEGORIES)c[k]=0;
    (products??[]).forEach((p:any)=>{ if(p.category)c[p.category]=(c[p.category]??0)+1; }); return c;
  }, [products]);
  const activeModels = Object.entries(modelsByCategory[active]??{}).sort((a,b)=>b[1]-a[1]);
  const ActiveIcon = CATEGORY_ICONS[active];

  const sidebar = (
    <aside className="w-[210px] sm:w-[228px] shrink-0 h-full bg-black/60 backdrop-blur border-r border-white/5 overflow-y-auto flex flex-col">
      <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Kategorije</span>
        <button onClick={onClose} className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="py-1 flex-1">
        {CATEGORIES.map(c => {
          const Icon = CATEGORY_ICONS[c]; const isActive = active === c;
          return (
            <button key={c} onMouseEnter={()=>setActive(c)} onClick={()=>setActive(c)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left text-[13px] font-bold uppercase tracking-wide transition-all border-l-2 ${isActive?"border-l-gold bg-gold/10 text-gold":"border-l-transparent text-foreground/60 hover:text-gold hover:bg-white/5"}`}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate leading-tight">{c}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive?"bg-gold/20 text-gold":"bg-white/5 text-muted-foreground"}`}>{countByCategory[c]??0}</span>
              <ChevronRight className={`h-3 w-3 shrink-0 transition ${isActive?"opacity-100 text-gold":"opacity-20"}`} />
            </button>
          );
        })}
      </div>
    </aside>
  );

  const panel = (
    <div className="flex-1 min-w-0 flex flex-col bg-black/40 backdrop-blur overflow-y-auto">
      {/* Hero image */}
      <div className="relative h-44 shrink-0 overflow-hidden">
        <img key={active} src={CATEGORY_IMAGES[active]} alt={active}
          className="absolute inset-0 w-full h-full object-cover"
          style={{animation:"megaFadeIn 0.42s cubic-bezier(0.22,1,0.36,1) both"}} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5 flex items-end gap-3">
          <div className="bg-gold/20 border border-gold/40 backdrop-blur-sm p-2.5 rounded-xl"><ActiveIcon className="h-7 w-7 text-gold" /></div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-wider text-white leading-tight">{active}</h3>
            <div className="h-0.5 w-10 bg-gold mt-1.5 rounded-full" />
          </div>
        </div>
        <Link to="/proizvodi" search={{kat:active,q:undefined} as any} onClick={onClose}
          className="absolute bottom-4 right-4 text-xs text-gold/80 hover:text-gold font-bold hover:underline">Vidi sve →</Link>
      </div>
      {/* Models grid */}
      <div className="p-5 flex-1">
        {activeModels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3"><LayoutGrid className="h-6 w-6 text-muted-foreground" /></div>
            <p className="text-muted-foreground text-sm mb-4">Još nema proizvoda u ovoj kategoriji</p>
            <Link to="/proizvodi" search={{kat:active,q:undefined} as any} onClick={onClose}
              className="bg-gold text-gold-foreground font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90">Otvori kategoriju</Link>
          </div>
        ) : (
          <>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.15em] mb-3">Modeli vozila</p>
            <div className="grid grid-cols-2 gap-2">
              {activeModels.map(([model,count])=>(
                <Link key={model} to="/proizvodi" search={{kat:active,q:model} as any} onClick={onClose}
                  className="group flex items-center justify-between bg-white/5 border border-white/8 rounded-xl px-4 py-3 hover:border-gold hover:bg-gold/8 transition-all">
                  <span className="font-black uppercase tracking-wide text-sm group-hover:text-gold transition truncate">{model}</span>
                  <span className="ml-2 bg-gold text-gold-foreground text-[11px] font-black rounded-full px-2.5 py-0.5 min-w-[1.75rem] text-center shrink-0">{count}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex shadow-2xl" style={{width:drawer?"min(680px,96vw)":"auto"}}>
      {sidebar}
      {panel}
      <style>{`@keyframes megaFadeIn{from{opacity:0;transform:scale(1.06)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
