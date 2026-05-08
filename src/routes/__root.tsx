import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition">Go home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition">Try again</button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Car-Tech RS — Premium Auto Oprema | Body Kitovi, LED, Xenon" },
      { name: "description", content: "Car-Tech RS — Premium auto body kitovi, LED i Xenon oprema, volani, stakla za farove i auto multimedije za BMW, Audi, Mercedes, VW i sve marke. Plaćanje pouzećem. Dostava 1-3 dana." },
      { name: "keywords", content: "auto body kitovi, body kit, led farovi, xenon, branik, spojler, difuzor, pragovi, auto oprema, BMW, Audi, Mercedes, VW, Srbija, Car-Tech RS" },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Car-Tech RS — Premium Auto Oprema" },
      { property: "og:description", content: "Premium auto body kitovi, LED, Xenon i auto oprema za sve marke. Plaćanje pouzećem, dostava Srbija." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Car-Tech RS — Premium Auto Oprema" },
      { name: "twitter:description", content: "Premium auto body kitovi, LED, Xenon i auto oprema za sve marke. Plaćanje pouzećem." },
      { name: "author", content: "Car-Tech RS" },
      { name: "language", content: "sr" },
      { name: "geo.region", content: "RS" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://car-tech.rs" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/* ── Global animated background ── */
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* Base deep bg */}
      <div className="absolute inset-0 bg-[oklch(0.12_0.01_250)]" />
      {/* Slow-shifting gold orb top-left */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.16 75 / 0.07) 0%, transparent 65%)", animation: "orbDrift1 18s ease-in-out infinite" }} />
      {/* Gold orb bottom-right */}
      <div className="absolute -bottom-60 -right-60 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.16 75 / 0.05) 0%, transparent 65%)", animation: "orbDrift2 22s ease-in-out infinite" }} />
      {/* Blue-purple mid glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-40"
        style={{ background: "radial-gradient(ellipse, oklch(0.30 0.04 265 / 0.15) 0%, transparent 70%)", animation: "orbDrift3 28s ease-in-out infinite" }} />
      {/* Very subtle moving grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(oklch(0.78 0.16 75) 1px,transparent 1px),linear-gradient(90deg,oklch(0.78 0.16 75) 1px,transparent 1px)", backgroundSize: "72px 72px", animation: "gridDrift 12s linear infinite" }} />
      <style>{`
        @keyframes orbDrift1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,-40px) scale(1.1)}66%{transform:translate(-30px,50px) scale(0.95)}}
        @keyframes orbDrift2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-50px,30px) scale(1.05)}70%{transform:translate(40px,-60px) scale(0.9)}}
        @keyframes orbDrift3{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.15)}}
      `}</style>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AnimatedBackground />
        <Outlet />
        <Toaster richColors position="top-right" />
      </CartProvider>
    </QueryClientProvider>
  );
}
