import { Link } from "@tanstack/react-router";
import { ShoppingCart, Check } from "lucide-react";
import { useCart, formatRSD } from "@/lib/cart";
import { toast } from "sonner";
import { useState } from "react";

type P = {
  id: string; name: string; price: number;
  image_url?: string | null; image_urls?: string[] | null;
  category: string; car_model?: string | null;
};

export function ProductCard({ p }: { p: P }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const displayImage = p.image_urls?.length ? p.image_urls[0] : p.image_url;
  const imageCount = p.image_urls?.length ?? (p.image_url ? 1 : 0);

  const handleAdd = () => {
    add({ id: p.id, name: p.name, price: p.price, image_url: displayImage });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);

    toast.success("Dodato u korpu!", {
      description: p.name,
      duration: 2500,
      icon: "🛒",
      action: {
        label: "Pogledaj korpu",
        onClick: () => { window.location.href = "/korpa"; },
      },
    });
  };

  return (
    <div className="relative group bg-card rounded-2xl overflow-hidden border border-border hover:border-gold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40">
      <Link to="/proizvod/$id" params={{ id: p.id }} className="block">
        <div className="aspect-square bg-white relative overflow-hidden">
          {displayImage ? (
            <img
              src={displayImage} alt={p.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <ShoppingCart className="h-10 w-10 text-neutral-300 opacity-40" />
            </div>
          )}

          {/* Category badge */}
          <span className="absolute top-2 left-2 bg-gold text-gold-foreground text-[9px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wide">
            {p.category.split(" ")[0]}
          </span>

          {/* Multi-image badge */}
          {imageCount > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
              +{imageCount - 1} 📷
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 md:p-4">
        <Link to="/proizvod/$id" params={{ id: p.id }}>
          <h3 className="font-bold leading-tight line-clamp-2 mb-1 group-hover:text-gold transition-colors text-xs md:text-sm">
            {p.name}
          </h3>
        </Link>
        {p.car_model && (
          <p className="text-[10px] md:text-xs text-muted-foreground mb-2 truncate">{p.car_model}</p>
        )}

        <div className="flex items-center justify-between mt-2 gap-1.5">
          <span className="text-sm md:text-base font-black text-gold shrink-0">{formatRSD(p.price)}</span>

          <button
            onClick={handleAdd}
            className={`relative flex items-center justify-center gap-1 px-2.5 md:px-3 py-2 rounded-xl font-black text-[10px] md:text-xs transition-all duration-300 shrink-0 ${
              added
                ? "bg-emerald-500 text-white scale-95 shadow-lg shadow-emerald-500/30"
                : "bg-gold text-gold-foreground hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-gold/30"
            }`}
            aria-label="Dodaj u korpu"
          >
            {added ? (
              <><Check className="h-3.5 w-3.5 md:h-4 md:w-4" /><span className="hidden sm:inline">Dodato!</span></>
            ) : (
              <><ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" /><span className="hidden sm:inline">Korpa</span></>
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes cartPop{0%{opacity:0;transform:translate(-50%,10px) scale(0.8)}15%{opacity:1;transform:translate(-50%,0) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-12px)}}`}</style>
    </div>
  );
}
