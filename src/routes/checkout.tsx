import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { useCart, formatRSD } from "@/lib/cart";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, FileDown, Package, Truck, Mail } from "lucide-react";
import { generateInvoicePDF } from "@/lib/pdf";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const Route = createFileRoute("/checkout")({ component: Page });

const schema = z.object({
  customer_name: z.string().trim().min(2, "Unesite ime i prezime").max(100),
  phone: z.string().trim().min(6, "Unesite telefon").max(30),
  email: z.string().trim().email("Email adresa nije ispravna").max(255),
  address: z.string().trim().min(3, "Unesite adresu").max(200),
  city: z.string().trim().min(2, "Unesite grad").max(100),
  postal_code: z.string().trim().min(3, "Unesite poštanski broj").max(20),
  note: z.string().trim().max(500).optional(),
});

function Page() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [done, setDone] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: "", phone: "", email: "",
    address: "", city: "", postal_code: "", note: "",
  });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Korpa je prazna"); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);

    // 1. Insert order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({ ...parsed.data, total })
      .select()
      .single();

    if (orderErr || !order) {
      toast.error("Greška: " + (orderErr?.message ?? "Nepoznata greška"));
      setLoading(false);
      return;
    }

    // 2. Insert order items — product_id je null da bi se izbegla FK greška
    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: null,
      product_name: i.name,
      quantity: i.quantity,
      price: i.price,
    }));
    await supabase.from("order_items").insert(orderItems);

    // 3. Send email via EmailJS (client-side, no server needed)
    const shortId = order.id.slice(0, 8).toUpperCase();
    const cancelUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/otkazi/${order.cancel_token}`;
    const itemsText = items
      .map(i => `• ${i.name} × ${i.quantity}  →  ${formatRSD(i.price * i.quantity)}`)
      .join("\n");

    try {
      await sendOrderConfirmationEmail({
        to_email: parsed.data.email,
        customer_name: parsed.data.customer_name,
        order_id: shortId,
        total_formatted: formatRSD(total),
        items_text: itemsText,
        cancel_url: cancelUrl,
        address: parsed.data.address,
        city: parsed.data.city,
        phone: parsed.data.phone,
      });
      toast.success("Email potvrda poslata!");
    } catch (emailErr) {
      console.warn("Email nije poslat (proveri EmailJS konfiguraciju):", emailErr);
      // Non-fatal — order is still created
    }

    clear();
    setDone({ ...order, order_items: orderItems, shortId, cancelUrl });
    setLoading(false);
  };

  /* ── SUCCESS PAGE ─────────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-2xl">

          <div className="text-center anim-scale-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gold/15 border-2 border-gold anim-gold-pulse mb-6">
              <CheckCircle2 className="h-12 w-12 text-gold" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black anim-fade-up delay-100" style={{ animationFillMode: "both" }}>
              Porudžbina Primljena!
            </h1>
            <p className="text-muted-foreground mt-3 text-lg anim-fade-up delay-200" style={{ animationFillMode: "both" }}>
              Hvala na poverenju,&nbsp;<span className="text-gold font-black">{done.customer_name}</span>!
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full anim-fade-up delay-250" style={{ animationFillMode: "both" }}>
              <span className="text-sm text-muted-foreground">Broj porudžbine:</span>
              <span className="font-mono font-black text-gold tracking-widest">#{done.shortId}</span>
            </div>
          </div>

          {/* Info cards */}
          <div className="mt-8 grid sm:grid-cols-3 gap-3 anim-fade-up delay-300" style={{ animationFillMode: "both" }}>
            {[
              { icon: Mail,    t: "Email Potvrda",    d: "Poslali smo potvrdu na vaš email" },
              { icon: Truck,   t: "Dostava 1–3 dana", d: "Pratite status vašeg paketa" },
              { icon: Package, t: "Pouzećem",         d: "Platite kuriru pri preuzimanju" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-card border border-border rounded-2xl p-5 text-center hover:border-gold transition group">
                <div className="inline-flex items-center justify-center w-11 h-11 bg-gold/10 group-hover:bg-gold rounded-xl mb-3 transition-all">
                  <Icon className="h-5 w-5 text-gold group-hover:text-gold-foreground transition" />
                </div>
                <div className="font-black text-sm">{t}</div>
                <div className="text-xs text-muted-foreground mt-1">{d}</div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="mt-5 bg-card border border-border rounded-2xl overflow-hidden anim-fade-up delay-400" style={{ animationFillMode: "both" }}>
            <div className="px-5 py-3 border-b border-border bg-black/20">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Detalji porudžbine</span>
            </div>
            <div className="p-5 space-y-2">
              {done.order_items?.map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i.product_name} × {i.quantity}</span>
                  <span className="font-bold">{formatRSD(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between font-black">
                <span>Ukupno</span>
                <span className="text-gold">{formatRSD(done.total)}</span>
              </div>
            </div>
          </div>

          {/* Cancel */}
          <div className="mt-5 bg-card border border-border rounded-2xl p-5 anim-fade-up delay-500" style={{ animationFillMode: "both" }}>
            <p className="text-sm font-black mb-1">Promena planova?</p>
            <p className="text-xs text-muted-foreground mb-3">
              Možete otkazati porudžbinu dok ne bude isporučena.
            </p>
            <Link to={`/otkazi/${done.cancel_token}`}
              className="inline-flex items-center gap-2 border border-destructive text-destructive font-bold text-sm px-4 py-2 rounded-xl hover:bg-destructive hover:text-destructive-foreground transition">
              ✕ Otkaži porudžbinu
            </Link>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 anim-fade-up delay-600" style={{ animationFillMode: "both" }}>
            <button onClick={() => generateInvoicePDF(done)}
              className="inline-flex items-center gap-2 bg-gold text-gold-foreground font-black px-6 py-3 rounded-xl hover:opacity-90 transition">
              <FileDown className="h-4 w-4" /> PDF Račun
            </button>
            <Link to="/"
              className="inline-flex items-center gap-2 border border-gold text-gold font-black px-6 py-3 rounded-xl hover:bg-gold hover:text-gold-foreground transition">
              Nazad na početnu
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (items.length === 0) { nav({ to: "/korpa" }); return null; }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-black mb-6 anim-fade-up">Plaćanje pouzećem</h1>
        <form onSubmit={submit} className="grid lg:grid-cols-[1fr_360px] gap-6 md:gap-8">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 anim-fade-up delay-100" style={{ animationFillMode: "both" }}>
            <h2 className="font-black text-lg">Vaši podaci za dostavu</h2>
            {[
              { k: "customer_name", l: "Ime i prezime *", type: "text",  ph: "Marko Marković" },
              { k: "phone",         l: "Telefon *",        type: "tel",   ph: "+381 60 000 0000" },
              { k: "email",         l: "Email *",          type: "email", ph: "marko@gmail.com" },
              { k: "address",       l: "Adresa *",         type: "text",  ph: "Ulica i broj" },
              { k: "city",          l: "Grad *",           type: "text",  ph: "Beograd" },
              { k: "postal_code",   l: "Poštanski broj *", type: "text",  ph: "11000" },
            ].map(({ k, l, type, ph }) => (
              <div key={k}>
                <label className="block text-sm font-bold mb-1">{l}</label>
                <input type={type} value={(form as any)[k]} onChange={e => upd(k, e.target.value)}
                  placeholder={ph}
                  className="w-full px-3 py-2.5 rounded-xl bg-background/60 border border-border focus:border-gold outline-none transition placeholder:text-muted-foreground/50" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-bold mb-1">Napomena (opciono)</label>
              <textarea value={form.note} onChange={e => upd("note", e.target.value)} rows={3}
                placeholder="Posebne instrukcije za dostavu..."
                className="w-full px-3 py-2.5 rounded-xl bg-background/60 border border-border focus:border-gold outline-none transition resize-none placeholder:text-muted-foreground/50" />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-2xl p-6 h-fit anim-fade-up delay-200" style={{ animationFillMode: "both" }}>
            <h3 className="font-black mb-4">Pregled porudžbine</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-auto pr-1">
              {items.map(i => (
                <div key={i.id} className="flex gap-3 items-center">
                  {i.image_url && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0">
                      <img src={i.image_url} alt={i.name} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold line-clamp-1">{i.name}</div>
                    <div className="text-[11px] text-muted-foreground">× {i.quantity}</div>
                  </div>
                  <span className="font-bold text-sm shrink-0">{formatRSD(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-xl font-black mb-5">
              <span>Ukupno</span>
              <span className="text-gold">{formatRSD(total)}</span>
            </div>
            <button disabled={loading}
              className="relative w-full bg-gold text-gold-foreground font-black py-4 rounded-xl disabled:opacity-60 hover:opacity-90 transition overflow-hidden group text-base">
              <span className="absolute inset-0 anim-shimmer-btn opacity-0 group-hover:opacity-100 transition pointer-events-none" />
              <span className="relative">{loading ? "⏳ Slanje..." : "✓  Potvrdi porudžbinu"}</span>
            </button>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" /> Potvrda dolazi na vaš email
            </div>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
