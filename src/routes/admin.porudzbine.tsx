import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Package, Phone, Mail, MapPin, Truck, X, ChevronDown, ChevronUp, FileDown, Trash2, Send, ImageIcon } from "lucide-react";
import { formatRSD } from "@/lib/cart";
import { generateInvoicePDF } from "@/lib/pdf";
import { sendBexSlipEmail } from "@/lib/email";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/porudzbine")({ component: Page });

const TABS = [
  { k: "all", l: "Sve" }, { k: "na_cekanju", l: "Na čekanju" },
  { k: "poslato", l: "Poslato" }, { k: "isporuceno", l: "Isporučeno" }, { k: "otkazano", l: "Otkazano" },
];

function Page() {
  const [tab, setTab] = useState("all");
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const orders = data ?? [];
  const counts: Record<string, number> = { all: orders.length };
  for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
  const filtered = tab === "all" ? orders : orders.filter((o: any) => o.status === tab);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status ažuriran"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); }
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati porudžbinu trajno?")) return;
    await supabase.from("order_items").delete().eq("order_id", id);
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Porudžbina obrisana"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); }
  };

  return (
    <div className="anim-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Porudžbine</h1>
        <p className="text-muted-foreground text-sm mt-1">Upravljajte porudžbinama kupaca</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition flex items-center gap-2 ${tab === t.k
              ? "bg-gold/15 text-gold border-gold/30"
              : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"}`}>
            {t.l}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${tab === t.k ? "bg-gold/20 text-gold" : "bg-white/5 text-muted-foreground"}`}>
              {counts[t.k] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-16 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Nema porudžbina</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o: any) => <OrderCard key={o.id} order={o} onStatus={setStatus} onDelete={remove} />)}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order: o, onStatus, onDelete }: any) {
  const [open, setOpen] = useState(false);
  const [bexOpen, setBexOpen] = useState(false);
  const [bexUrl, setBexUrl] = useState("");
  const [bexMsg, setBexMsg] = useState("Poštovani, u prilogu se nalazi vaš Bex nalog za dostavu. Hvala što ste izabrali Car-Tech RS!");
  const [sendingBex, setSendingBex] = useState(false);

  const handleSendBex = async () => {
    if (!bexUrl.trim()) { toast.error("Unesite URL slike Bex naloga"); return; }
    if (!o.email) { toast.error("Kupac nema email adresu"); return; }
    setSendingBex(true);
    try {
      await sendBexSlipEmail({
        to_email: o.email,
        customer_name: o.customer_name,
        order_id: o.id.slice(0, 8).toUpperCase(),
        bex_image_url: bexUrl.trim(),
        admin_message: bexMsg.trim(),
      });
      toast.success(`Bex nalog poslat na ${o.email}`);
      setBexOpen(false); setBexUrl("");
    } catch (err: any) {
      toast.error("Greška: " + (err?.message ?? String(err)));
    }
    setSendingBex(false);
  };

  const statusColor: Record<string, string> = {
    na_cekanju: "bg-amber-400/15 text-amber-400 border-amber-400/25",
    poslato:    "bg-blue-400/15 text-blue-400 border-blue-400/25",
    isporuceno: "bg-green-400/15 text-green-400 border-green-400/25",
    otkazano:   "bg-neutral-500/15 text-neutral-400 border-neutral-500/25",
  };
  const statusLabel: Record<string, string> = { na_cekanju: "Na čekanju", poslato: "Poslato", isporuceno: "Isporučeno", otkazano: "Otkazano" };

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all">
      {/* Header */}
      <div className="p-4 md:p-5 flex items-center gap-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
          <span className="text-gold font-black text-sm">{o.customer_name?.[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm truncate">{o.customer_name}</p>
          <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("sr-RS")}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-black text-gold">{formatRSD(Number(o.total))}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border mt-0.5 inline-block ${statusColor[o.status] ?? "bg-neutral-500/15 text-neutral-400 border-neutral-500/25"}`}>
            {statusLabel[o.status] ?? o.status}
          </span>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-white/5 p-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Customer */}
            <div className="space-y-2.5">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Podaci Kupca</p>
              {[
                { icon: Phone, v: o.phone },
                { icon: Mail,  v: o.email },
                { icon: MapPin, v: `${o.address}, ${o.postal_code} ${o.city}` },
              ].map(({ icon: Icon, v }) => v ? (
                <div key={v} className="flex items-start gap-2 text-sm">
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{v}</span>
                </div>
              ) : null)}
              {o.note && <p className="text-sm text-muted-foreground border border-white/8 bg-white/[0.02] rounded-xl px-3 py-2">{o.note}</p>}
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Poručeni Proizvodi</p>
              <div className="space-y-2">
                {o.order_items?.map((it: any) => (
                  <div key={it.id} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2">
                    <div>
                      <p className="font-bold text-sm">{it.product_name}</p>
                      <p className="text-xs text-muted-foreground">× {it.quantity}</p>
                    </div>
                    <span className="font-black text-sm text-gold">{formatRSD(Number(it.price) * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bex slip panel */}
          {bexOpen && (
            <div className="bg-blue-400/8 border border-blue-400/20 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5" /> Pošalji Bex Nalog ({o.email})
              </p>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">URL slike Bex naloga *</label>
                <input value={bexUrl} onChange={e => setBexUrl(e.target.value)}
                  placeholder="https://i.imgur.com/abc123.jpg"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400 outline-none text-sm transition" />
                {bexUrl && (
                  <div className="mt-2 max-h-40 overflow-hidden rounded-xl border border-white/10">
                    <img src={bexUrl} alt="Bex preview" className="w-full object-contain max-h-40 bg-white/5" onError={e => (e.target as any).style.opacity = "0.2"} />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">Poruka kupcu</label>
                <textarea value={bexMsg} onChange={e => setBexMsg(e.target.value)} rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400 outline-none text-sm transition resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSendBex} disabled={sendingBex}
                  className="inline-flex items-center gap-2 bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-blue-600 transition disabled:opacity-50">
                  <Send className="h-4 w-4" /> {sendingBex ? "Slanje..." : "Pošalji email"}
                </button>
                <button onClick={() => setBexOpen(false)} className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-foreground transition">
                  Otkaži
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            <button onClick={() => generateInvoicePDF(o)}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition">
              <FileDown className="h-4 w-4" /> PDF Račun
            </button>
            <button onClick={() => setBexOpen(!bexOpen)}
              className={`inline-flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-bold transition ${bexOpen ? "bg-blue-400/15 border-blue-400/30 text-blue-400" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
              <ImageIcon className="h-4 w-4" /> Bex Nalog
            </button>
            {o.status === "na_cekanju" && (
              <button onClick={() => onStatus(o.id, "poslato")}
                className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-500/25 transition">
                <Truck className="h-4 w-4" /> Označi Poslato
              </button>
            )}
            {o.status === "poslato" && (
              <button onClick={() => onStatus(o.id, "isporuceno")}
                className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-500/25 transition">
                ✓ Isporučeno
              </button>
            )}
            {o.status !== "otkazano" && o.status !== "isporuceno" && (
              <button onClick={() => onStatus(o.id, "otkazano")}
                className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/20 transition">
                <X className="h-4 w-4" /> Otkaži
              </button>
            )}
            <button onClick={() => onDelete(o.id)}
              className="ml-auto inline-flex items-center gap-2 bg-red-900/20 border border-red-900/30 text-red-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-900/40 transition">
              <Trash2 className="h-4 w-4" /> Obriši
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
