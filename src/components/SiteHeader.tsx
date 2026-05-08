import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import { useCart, formatRSD } from "@/lib/cart";
import { CATEGORIES } from "@/lib/categories";
import { CategoriesMegaMenu } from "@/components/CategoriesMegaMenu";

export function SiteHeader() {
  const { count, total } = useCart();
  const [q, setQ] = useState("");
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    document.body.style.overflow = megaOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [megaOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/proizvodi", search: { q: q || undefined, kat: undefined } as any });
  };

  return (
    <>
      <header className="bg-black/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center gap-3 md:gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-white rounded-md p-1"><img src={logo} alt="Car-Tech RS" className="h-8 md:h-10 w-auto" /></div>
            <span className="hidden sm:block font-black tracking-wider text-gold text-sm md:text-base">CAR-TECH <span className="text-foreground">RS</span></span>
          </Link>
          <form onSubmit={submit} className="flex-1 flex max-w-3xl">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Pretraži proizvode..."
              className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-l-md bg-white text-neutral-900 outline-none text-sm min-w-0" />
            <button className="bg-gold text-gold-foreground px-3 md:px-5 rounded-r-md hover:opacity-90 transition shrink-0">
              <Search className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </form>
          <Link to="/korpa"
            className="border border-gold/60 px-3 md:px-4 py-2 md:py-3 rounded-xl flex items-center gap-1.5 md:gap-2 text-gold hover:bg-gold hover:text-gold-foreground transition shrink-0">
            <span className="font-black text-xs md:text-sm hidden sm:block">{formatRSD(total)}</span>
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && <span className="bg-gold text-gold-foreground text-xs rounded-full px-1.5 py-0.5 font-black min-w-[1.25rem] text-center">{count}</span>}
          </Link>
          <button className="md:hidden border border-border p-2 rounded-md" onClick={()=>setMobileNavOpen(!mobileNavOpen)}>
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <nav className="bg-surface/60 backdrop-blur border-t border-border hidden md:block">
          <div className="container mx-auto px-4 py-2.5 flex flex-wrap gap-2">
            <button onClick={()=>setMegaOpen(true)}
              className="bg-gold text-gold-foreground px-4 py-2 rounded-lg text-sm font-black uppercase tracking-wide flex items-center gap-2 hover:opacity-90 transition">
              <Menu className="h-4 w-4" /> Sve Kategorije
            </button>
            {CATEGORIES.slice(0,6).map(c=>(
              <Link key={c} to="/proizvodi" search={{kat:c,q:undefined} as any}
                className="border border-border bg-card/60 backdrop-blur px-3 py-2 rounded-lg text-sm font-semibold hover:border-gold hover:text-gold transition">{c}</Link>
            ))}
          </div>
        </nav>
        {mobileNavOpen && (
          <nav className="md:hidden bg-surface/80 backdrop-blur border-t border-border">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1.5">
              <button onClick={()=>{setMegaOpen(true);setMobileNavOpen(false);}}
                className="bg-gold text-gold-foreground px-4 py-2.5 rounded-lg text-sm font-black uppercase text-left flex items-center gap-2">
                <Menu className="h-4 w-4" /> Sve Kategorije
              </button>
              {CATEGORIES.map(c=>(
                <Link key={c} to="/proizvodi" search={{kat:c,q:undefined} as any} onClick={()=>setMobileNavOpen(false)}
                  className="border border-border bg-card/60 px-3 py-2.5 rounded-lg text-sm font-semibold hover:border-gold hover:text-gold transition">{c}</Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Backdrop */}
      <div onClick={()=>setMegaOpen(false)} className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        style={{opacity:megaOpen?1:0,pointerEvents:megaOpen?"auto":"none"}} />

      {/* Left sliding drawer */}
      <div className="fixed top-0 left-0 h-full z-50"
        style={{transform:megaOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.38s cubic-bezier(0.32,0.72,0,1)",willChange:"transform"}}>
        <CategoriesMegaMenu onClose={()=>setMegaOpen(false)} drawer />
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-black/80 backdrop-blur border-t border-border mt-16">
      <div className="container mx-auto px-4 py-10 grid sm:grid-cols-2 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="text-gold font-black text-lg mb-3">CAR-TECH RS</h3>
          <p className="text-muted-foreground">Premium auto oprema i tjuning delovi za sve popularne marke automobila.</p>
        </div>
        <div>
          <h4 className="font-bold mb-3">Kontakt</h4>
          <p className="text-muted-foreground">Email: info@car-tech.rs</p>
          <p className="text-muted-foreground">Telefon: +381 60 000 0000</p>
        </div>
        <div>
          <h4 className="font-bold mb-3">Plaćanje</h4>
          <p className="text-muted-foreground">Pouzećem prilikom isporuke. Brza dostava širom Srbije.</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Car-Tech RS. Sva prava zadržana.
      </div>
    </footer>
  );
}
