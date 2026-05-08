import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, CATEGORY_IMAGES } from "@/lib/categories";
import { CarBrandsGrid } from "@/components/CarBrandsGrid";
import { BrandMarquee } from "@/components/BrandMarquee";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Truck, Shield, Wrench, Award, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function useCountUp(end: number, duration = 1600, trigger = false) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let t0: number | null = null;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, trigger]);
  return v;
}

function StatCard({ value, suffix = "", label, delay = 0 }: { value: number; suffix?: string; label: string; delay?: number }) {
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, 1600, on);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true); }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center anim-fade-up" style={{ animationDelay:`${delay}ms`, animationFillMode:"both" }}>
      <div className="text-4xl md:text-5xl font-black text-gold anim-gold-glow">{count}{suffix}</div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">{label}</div>
    </div>
  );
}

function Particle({ x, y, dur, delay }: { x: string; y: string; dur: number; delay: number }) {
  return <span className="absolute w-1 h-1 rounded-full bg-gold/60 pointer-events-none"
    style={{ left:x, top:y, animation:`particleFloat ${dur}s ease-in-out ${delay}s infinite` }} />;
}

function Home() {
  const { data: featured } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => { const { data } = await supabase.from("products").select("*").limit(8).order("created_at",{ascending:false}); return data??[]; },
  });

  const particles = Array.from({length:20},(_,i)=>({ x:`${(i*19+5)%92}%`, y:`${(i*29+8)%82}%`, dur:3.5+(i%4), delay:(i*0.4)%3 }));

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b border-border min-h-[90vh] flex items-center">
          {/* Radial sweep bg — layered on top of global bg */}
          <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 80% 65% at 10% 50%, oklch(0.22 0.05 258 / 0.7) 0%, transparent 70%)" }} />
          {/* Extra gold orb for hero */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background:"radial-gradient(circle,oklch(0.78 0.16 75/0.12) 0%,transparent 65%)", animation:"orbDrift1 14s ease-in-out infinite" }} />
          {/* Moving grid (slightly denser in hero) */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage:"linear-gradient(oklch(0.78 0.16 75) 1px,transparent 1px),linear-gradient(90deg,oklch(0.78 0.16 75) 1px,transparent 1px)", backgroundSize:"54px 54px", animation:"gridDrift 9s linear infinite" }} />
          {/* Particles */}
          {particles.map((p,i) => <Particle key={i} x={p.x} y={p.y} dur={p.dur} delay={p.delay} />)}

          <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left */}
            <div>
              <div className="anim-badge-pop inline-flex items-center gap-2.5 border border-gold/40 bg-gold/10 text-gold px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.22em]" style={{animationFillMode:"both"}}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                </span>
                Premium Kvalitet
              </div>
              <h1 className="mt-6 font-black tracking-tight leading-[0.95]">
                {[{t:"AUTO",g:true,d:"0.12s"},{t:"BODY",g:true,d:"0.22s"},{t:"KITOVI",g:false,d:"0.32s"},{t:"& OPREMA",g:false,d:"0.42s"}].map(({t,g,d})=>(
                  <span key={t} className={`block text-5xl sm:text-6xl md:text-7xl anim-slide-right ${g?"text-gold anim-gold-glow":""}`} style={{animationDelay:d,animationFillMode:"both"}}>{t}</span>
                ))}
              </h1>
              <div className="mt-5 h-1 rounded-full bg-gold" style={{width:80,animation:"lineExpand 0.8s 0.55s cubic-bezier(0.22,1,0.36,1) forwards",opacity:0}} />
              <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-lg anim-fade-up delay-500" style={{animationFillMode:"both"}}>
                Transformišite izgled vašeg automobila sa premium body kit delovima. Branici, spojleri, pragovi i difuzori za sve marke.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["OEM Kvalitet","Laka Montaža","Garancija","Brza Isporuka"].map((f,i)=>(
                  <span key={f} className="inline-flex items-center gap-1.5 border border-border bg-card/70 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-semibold anim-fade-up hover:border-gold hover:text-gold transition-all" style={{animationDelay:`${0.6+i*0.07}s`,animationFillMode:"both"}}>
                    <Check className="h-3.5 w-3.5 text-gold shrink-0" />{f}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3 anim-fade-up delay-800" style={{animationFillMode:"both"}}>
                <Link to="/proizvodi"
                  className="relative inline-flex items-center gap-2.5 bg-gold text-gold-foreground font-black px-8 py-4 rounded-2xl uppercase tracking-wide overflow-hidden group hover:scale-105 transition-transform"
                  style={{boxShadow:"0 8px 32px oklch(0.78 0.16 75/0.5)"}}>
                  <span className="absolute inset-0 anim-shimmer-btn opacity-0 group-hover:opacity-100 transition pointer-events-none" />
                  <span className="relative">Pogledaj Ponudu</span>
                  <ArrowRight className="h-4 w-4 relative group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/proizvodi" search={{kat:"Auto Body Kitovi"} as any}
                  className="inline-flex items-center gap-2 border border-gold/50 text-gold font-black px-7 py-4 rounded-2xl uppercase tracking-wide hover:bg-gold/10 hover:border-gold transition-all">
                  Body Kitovi <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right: Category cards */}
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.slice(0,4).map((c,i)=>(
                <Link key={c} to="/proizvodi" search={{kat:c} as any}
                  className="aspect-square relative rounded-2xl overflow-hidden border border-white/10 hover:border-gold transition-all duration-400 group anim-scale-in hover:-translate-y-2"
                  style={{animationDelay:`${0.3+i*0.1}s`,animationFillMode:"both",boxShadow:"0 4px 24px rgba(0,0,0,0.5)"}}>
                  <img src={CATEGORY_IMAGES[c]} alt={c}
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-65 group-hover:scale-110 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-gold/0 group-hover:border-gold/60 transition-all duration-400" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-[10px] text-gold uppercase font-black tracking-[0.2em] block mb-0.5">Kategorija</span>
                    <span className="text-sm md:text-base font-black group-hover:text-gold transition-colors duration-300 block leading-tight">{c}</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-gold text-gold-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BRAND MARQUEE ════════════════════════════════ */}
        <BrandMarquee />

        {/* ══ STATS ═════════════════════════════════════════ */}
        <section className="bg-surface/60 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value={500} suffix="+" label="Proizvoda" delay={0} />
            <StatCard value={18} suffix="+" label="Auto Marki" delay={100} />
            <StatCard value={9} suffix="" label="Kategorija" delay={200} />
            <StatCard value={24} suffix="h" label="Isporuka" delay={300} />
          </div>
        </section>

        {/* ══ BENEFITS ══════════════════════════════════════ */}
        <section className="border-b border-border bg-surface/40 backdrop-blur">
          <div className="container mx-auto px-4 py-10 md:py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {icon:Truck,  title:"Brza Dostava",      desc:"Širom Srbije 1-3 dana",        delay:0},
              {icon:Shield, title:"Plaćanje Pouzećem", desc:"Plati kuriru pri preuzimanju", delay:80},
              {icon:Award,  title:"Garancija",         desc:"Provereni premium proizvodi",  delay:160},
              {icon:Wrench, title:"Stručna Podrška",   desc:"Pomoć pri izboru i montaži",   delay:240},
            ].map(({icon:Icon,title,desc,delay})=>(
              <div key={title} className="group flex gap-4 anim-fade-up" style={{animationDelay:`${delay}ms`,animationFillMode:"both"}}>
                <div className="shrink-0 bg-gold/10 text-gold p-3 rounded-xl h-fit group-hover:bg-gold group-hover:text-gold-foreground transition-all duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black group-hover:text-gold transition-colors">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ ALL CATEGORIES ════════════════════════════════ */}
        <section className="container mx-auto px-4 py-14 md:py-20">
          <div className="text-center mb-10 anim-fade-up">
            <span className="text-gold text-xs font-black uppercase tracking-[0.22em]">Asortiman</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 tracking-tight">SVE KATEGORIJE</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">Izaberite kategoriju i pronađite delove za vaš automobil</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {CATEGORIES.map((c,i)=>(
              <Link key={c} to="/proizvodi" search={{kat:c} as any}
                className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border hover:border-gold transition-all duration-300 group anim-fade-up hover:-translate-y-1"
                style={{animationDelay:`${i*55}ms`,animationFillMode:"both"}}>
                <img src={CATEGORY_IMAGES[c]} alt={c} className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-55 group-hover:scale-110 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 rounded-xl border-2 border-gold/0 group-hover:border-gold/40 transition-all duration-400" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-xs md:text-sm font-black leading-tight group-hover:text-gold transition-colors block">{c}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ FEATURED ══════════════════════════════════════ */}
        <section className="container mx-auto px-4 pb-14 md:pb-20">
          <div className="flex items-end justify-between mb-8 anim-fade-up">
            <div>
              <span className="text-gold text-xs font-black uppercase tracking-[0.22em]">Najnovije</span>
              <h2 className="text-2xl md:text-3xl font-black mt-1">Izdvojeni Proizvodi</h2>
            </div>
            <Link to="/proizvodi" className="text-gold hover:underline text-sm font-bold flex items-center gap-1">Vidi sve <ChevronRight className="h-4 w-4" /></Link>
          </div>
          {featured && featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {featured.map((p:any,i:number)=>(
                <div key={p.id} className="anim-fade-up relative" style={{animationDelay:`${i*50}ms`,animationFillMode:"both"}}>
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">Još nema proizvoda. Admin može dodati prve iz panela.</div>
          )}
        </section>

        <CarBrandsGrid />
      </main>
      <SiteFooter />
    </div>
  );
}
