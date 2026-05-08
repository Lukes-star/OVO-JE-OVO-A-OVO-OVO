const BRANDS = [
  { name: "Audi",       slug: "audi" },
  { name: "BMW",        slug: "bmw" },
  { name: "Mercedes",   slug: "mercedes" },
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Opel",       slug: "opel" },
  { name: "Ford",       slug: "ford" },
  { name: "Renault",    slug: "renault" },
  { name: "Peugeot",    slug: "peugeot" },
  { name: "Citroen",    slug: "citroen" },
  { name: "Fiat",       slug: "fiat" },
  { name: "Toyota",     slug: "toyota" },
  { name: "Honda",      slug: "honda" },
  { name: "Hyundai",    slug: "hyundai" },
  { name: "Kia",        slug: "kia" },
  { name: "Skoda",      slug: "skoda" },
  { name: "Seat",       slug: "seat" },
  { name: "Volvo",      slug: "volvo" },
  { name: "Mazda",      slug: "mazda" },
];

const doubled = [...BRANDS, ...BRANDS];

export function BrandMarquee() {
  return (
    <div className="relative border-y border-white/8 bg-black/40 backdrop-blur overflow-hidden"
      style={{ height: 80 }}>
      {/* fade edges */}
      <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #0a0a0a 0%, transparent 100%)" }} />
      <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(270deg, #0a0a0a 0%, transparent 100%)" }} />

      <div className="flex items-center h-full group/marquee">
        <div
          className="flex items-center gap-12 whitespace-nowrap"
          style={{
            width: "max-content",
            animation: "marqueeScroll 40s linear infinite",
          }}
          onMouseEnter={e => (e.currentTarget.style.animationPlayState = "paused")}
          onMouseLeave={e => (e.currentTarget.style.animationPlayState = "running")}
        >
          {doubled.map((b, i) => (
            <div key={i}
              className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-default px-2">
              <img
                src={`https://cdn.simpleicons.org/${b.slug}/ffffff`}
                alt={b.name}
                width={32}
                height={32}
                className="h-8 w-auto object-contain shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-white/80">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
