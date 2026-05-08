import { Link } from "@tanstack/react-router";
import { CAR_BRANDS, BRAND_LOGOS } from "@/lib/carBrands";
import { useState } from "react";

function BrandLogo({ brand }: { brand: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
        <span className="text-gold font-black text-lg">{brand[0]}</span>
      </div>
    );
  }
  return (
    <img
      src={BRAND_LOGOS[brand as keyof typeof BRAND_LOGOS]}
      alt={brand}
      className="h-12 w-12 object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(201,162,39,0.6)]"
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}

export function CarBrandsGrid() {
  return (
    <section className="border-t border-border bg-surface/30 backdrop-blur">
      <div className="container mx-auto px-4 py-14 md:py-20">
        <div className="text-center mb-10 anim-fade-up">
          <span className="text-gold text-xs font-black uppercase tracking-[0.22em]">Po marki vozila</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2 tracking-tight">KATEGORIJE AUTOMOBILA</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
            Izaberite marku vašeg automobila i pronađite kompatibilne LED, Xenon i ostale delove.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {CAR_BRANDS.map((brand, i) => (
            <Link
              key={brand}
              to="/proizvodi"
              search={{ brand, q: undefined, kat: undefined } as any}
              className="group relative bg-card/60 backdrop-blur border border-border rounded-2xl p-4 md:p-5 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-gold hover:bg-gold/8 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10 anim-fade-up"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
            >
              {/* Glow ring on hover */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-gold/0 group-hover:ring-gold/30 transition-all duration-300" />

              <div className="mb-2.5 flex items-center justify-center h-12 w-12">
                <BrandLogo brand={brand} />
              </div>

              <span className="font-black uppercase tracking-wider text-[11px] md:text-xs group-hover:text-gold transition-colors leading-tight">
                {brand}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
