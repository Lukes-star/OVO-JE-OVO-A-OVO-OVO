import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { useCart, formatRSD } from "@/lib/cart";
import { useState } from "react";
import { ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/proizvod/$id")({ component: Page });

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent] = useState(0);
  if (images.length === 0) {
    return (
      <div className="bg-white rounded-lg overflow-hidden aspect-square flex items-center justify-center text-neutral-400">
        Nema slike
      </div>
    );
  }
  if (images.length === 1) {
    return (
      <div className="bg-white rounded-lg overflow-hidden aspect-square">
        <img src={images[0]} alt={name} className="w-full h-full object-contain" />
      </div>
    );
  }
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg overflow-hidden aspect-square relative group">
        <img src={images[current]} alt={name} className="w-full h-full object-contain" />
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition hover:bg-black/80"
          aria-label="Prethodna"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition hover:bg-black/80"
          aria-label="Sledeća"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition ${i === current ? "bg-gold scale-125" : "bg-black/40 hover:bg-black/60"}`}
            />
          ))}
        </div>
      </div>
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition ${i === current ? "border-gold" : "border-transparent opacity-60 hover:opacity-90"}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Page() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  const images: string[] = p
    ? ((p as any).image_urls?.length ? (p as any).image_urls : p.image_url ? [p.image_url] : [])
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Link to="/proizvodi" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold mb-6 text-sm"><ArrowLeft className="h-4 w-4" /> Nazad</Link>
        {isLoading ? <div>Učitavanje...</div> : !p ? (
          <div className="text-center py-20">Proizvod nije pronađen.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            <ImageGallery images={images} name={p.name} />
            <div>
              <span className="text-gold text-xs font-bold uppercase tracking-widest">{p.category}</span>
              <h1 className="text-4xl font-black mt-2">{p.name}</h1>
              {p.car_model && <p className="text-muted-foreground mt-1">Model: <span className="text-foreground">{p.car_model}</span></p>}
              <div className="text-4xl font-black text-gold mt-6">{formatRSD(p.price)}</div>
              {p.description && <p className="mt-6 text-muted-foreground whitespace-pre-line">{p.description}</p>}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex items-center border border-border rounded-md">
                  <button className="px-3 py-2" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span className="px-4 font-semibold">{qty}</span>
                  <button className="px-3 py-2" onClick={() => setQty(qty + 1)}>+</button>
                </div>
                <button
                  onClick={() => { add({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }, qty); toast.success("Dodato u korpu"); }}
                  className="flex-1 bg-gold text-gold-foreground font-bold px-6 py-3 rounded-md flex items-center justify-center gap-2 hover:opacity-90"
                >
                  <ShoppingCart className="h-5 w-5" /> Dodaj u korpu
                </button>
              </div>
              <button onClick={() => { add({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url }, qty); nav({ to: "/korpa" }); }} className="mt-3 w-full border border-gold text-gold font-bold px-6 py-3 rounded-md hover:bg-gold hover:text-gold-foreground transition">Naruči odmah</button>
              <p className="mt-6 text-sm text-muted-foreground">✓ Plaćanje pouzećem · ✓ Brza dostava · ✓ Garancija</p>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
