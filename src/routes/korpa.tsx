import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { useCart, formatRSD } from "@/lib/cart";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/korpa")({ component: Page });

function Page() {
  const { items, remove, setQty, total } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-10">
        <h1 className="text-2xl md:text-3xl font-black mb-6">Korpa</h1>
        {items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-4">Vaša korpa je prazna.</p>
            <Link to="/proizvodi" className="bg-gold text-gold-foreground font-bold px-6 py-3 rounded-md inline-block">Pregledaj proizvode</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_340px] gap-6 md:gap-8">
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.id} className="bg-card border border-border rounded-lg p-3 md:p-4 flex items-center gap-3 md:gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded overflow-hidden shrink-0">
                    {i.image_url && <img src={i.image_url} alt={i.name} className="w-full h-full object-contain" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-1 text-sm md:text-base">{i.name}</h3>
                    <p className="text-gold font-bold text-sm md:text-base">{formatRSD(i.price)}</p>
                  </div>
                  <div className="flex items-center border border-border rounded-md shrink-0">
                    <button className="px-2 md:px-3 py-1.5 text-sm md:text-base" onClick={() => setQty(i.id, i.quantity - 1)}>−</button>
                    <span className="px-2 md:px-3 font-semibold text-sm">{i.quantity}</span>
                    <button className="px-2 md:px-3 py-1.5 text-sm md:text-base" onClick={() => setQty(i.id, i.quantity + 1)}>+</button>
                  </div>
                  <div className="font-bold text-right text-sm md:text-base w-20 md:w-28 hidden sm:block">{formatRSD(i.price * i.quantity)}</div>
                  <button onClick={() => remove(i.id)} className="text-destructive p-1.5 md:p-2 hover:bg-destructive/10 rounded shrink-0"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-lg p-5 md:p-6 h-fit">
              <h3 className="font-bold text-lg mb-4">Pregled porudžbine</h3>
              <div className="flex justify-between mb-2 text-sm"><span className="text-muted-foreground">Proizvodi</span><span>{formatRSD(total)}</span></div>
              <div className="flex justify-between mb-2 text-sm"><span className="text-muted-foreground">Dostava</span><span>Pouzećem</span></div>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between text-xl font-bold mb-5"><span>Ukupno</span><span className="text-gold">{formatRSD(total)}</span></div>
              <Link to="/checkout" className="block text-center bg-gold text-gold-foreground font-bold py-3 rounded-md hover:opacity-90">Nastavi na plaćanje</Link>
              <p className="text-xs text-muted-foreground mt-3 text-center">Plaćanje pouzećem prilikom isporuke.</p>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
