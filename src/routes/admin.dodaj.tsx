import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCategories, DEFAULT_CATEGORIES } from "@/lib/categories";
import { CAR_BRANDS } from "@/lib/carBrands";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/admin/dodaj")({
  component: Page,
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
});

function Page() {
  const { id } = Route.useSearch();
  const nav = useNavigate();
  const { data: dynamicCategories } = useCategories();
  const allCategories = dynamicCategories ?? DEFAULT_CATEGORIES;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    car_brand: "",
    car_model_custom: "",
    image_url: "",
    image_urls: [] as string[],
    in_stock: true,
  });
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (!id) return;
    supabase.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) {
        const carModel = data.car_model ?? "";
        const brand = (CAR_BRANDS as readonly string[]).find((b) => carModel.startsWith(b)) ?? "";
        const custom = brand ? carModel.slice(brand.length).trim() : carModel;
        const existingUrls: string[] = (data as any).image_urls ?? (data.image_url ? [data.image_url] : []);
        setForm({
          name: data.name,
          description: data.description ?? "",
          price: String(data.price),
          category: data.category,
          car_brand: brand,
          car_model_custom: custom,
          image_url: data.image_url ?? "",
          image_urls: existingUrls,
          in_stock: data.in_stock,
        });
      }
    });
  }, [id]);

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (form.image_urls.includes(url)) { toast.error("Ova URL je već dodana"); return; }
    setForm({ ...form, image_urls: [...form.image_urls, url] });
    setNewImageUrl("");
  };

  const removeImageUrl = (url: string) => {
    setForm({ ...form, image_urls: form.image_urls.filter((u) => u !== url) });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error("Popunite obavezna polja"); return; }
    setLoading(true);

    const carModel = form.car_brand
      ? (form.car_model_custom.trim() ? `${form.car_brand} ${form.car_model_custom.trim()}` : form.car_brand)
      : (form.car_model_custom.trim() || null);

    const allImages = form.image_urls.filter(Boolean);
    const firstImage = allImages[0] || form.image_url.trim() || null;

    const payloadFull = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      category: form.category,
      car_model: carModel,
      image_url: firstImage,
      image_urls: allImages.length > 0 ? allImages : (form.image_url.trim() ? [form.image_url.trim()] : []),
      in_stock: form.in_stock,
    };

    // Try saving with image_urls first; fallback without it if column doesn't exist yet
    let error;
    if (id) {
      ({ error } = await supabase.from("products").update(payloadFull).eq("id", id));
    } else {
      ({ error } = await supabase.from("products").insert(payloadFull));
    }

    // If image_urls column missing (migration not run), retry without it
    if (error && error.message && error.message.includes("image_urls")) {
      const { image_urls: _omit, ...payloadBasic } = payloadFull;
      if (id) {
        ({ error } = await supabase.from("products").update(payloadBasic).eq("id", id));
      } else {
        ({ error } = await supabase.from("products").insert(payloadBasic));
      }
      if (!error) toast.info("Slike sačuvane (pokreni SQL migraciju za podršku više slika)");
    }

    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success(id ? "Sacuvano" : "Proizvod dodat"); nav({ to: "/admin/proizvodi" }); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold">{id ? "Izmeni Proizvod" : "Dodaj Proizvod"}</h1>
      <p className="text-muted-foreground mb-6">Unesite podatke o {id ? "" : "novom "}proizvodu</p>

      <form onSubmit={submit} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <Field label="Ime Proizvoda *">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="npr. BMW F30 M Sport Prednji Branik" className="input" />
        </Field>
        <Field label="Opis">
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detaljan opis proizvoda..." rows={4} className="input" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Cena (EUR) *">
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="99.99" className="input" />
          </Field>
          <Field label="Kategorija *">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
              <option value="">Izaberi kategoriju</option>
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Marka Auta">
            <select value={form.car_brand} onChange={(e) => setForm({ ...form, car_brand: e.target.value })} className="input">
              <option value="">-- Izaberi marku --</option>
              {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Model / Generacija">
            <input
              value={form.car_model_custom}
              onChange={(e) => setForm({ ...form, car_model_custom: e.target.value })}
              placeholder={form.car_brand ? "npr. F30, A4 B8, W204" : "npr. F30, A4 B8..."}
              className="input"
            />
          </Field>
        </div>
        {(form.car_brand || form.car_model_custom) && (
          <p className="text-xs text-muted-foreground -mt-2">
            Model: <span className="text-gold font-semibold">{[form.car_brand, form.car_model_custom].filter(Boolean).join(" ")}</span>
          </p>
        )}

        <Field label="Slike Proizvoda (URL adrese)">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
                placeholder="https://example.com/slika.jpg"
                className="input flex-1"
              />
              <button type="button" onClick={addImageUrl} className="bg-primary text-primary-foreground px-3 py-2 rounded-md flex items-center gap-1 shrink-0 text-sm font-semibold">
                <Plus className="h-4 w-4" /> Dodaj
              </button>
            </div>
            {form.image_urls.length > 0 ? (
              <div className="space-y-2 mt-2">
                {form.image_urls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 bg-background border border-border rounded-md p-2">
                    <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                      <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <span className="flex-1 text-xs truncate text-muted-foreground">{url}</span>
                    {i === 0 && <span className="text-[10px] bg-gold text-gold-foreground px-1.5 py-0.5 rounded font-bold shrink-0">Naslovna</span>}
                    <button type="button" onClick={() => removeImageUrl(url)} className="text-destructive hover:bg-destructive/10 p-1 rounded shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Dodajte jednu ili više slika. Prva slika će biti naslovna.</p>
            )}
          </div>
        </Field>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} className="h-4 w-4 accent-emerald-600" />
          <span className="text-sm font-medium">Na stanju</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button disabled={loading} className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-md disabled:opacity-50">{loading ? "Čekaj..." : id ? "Sacuvaj" : "Dodaj Proizvod"}</button>
          <button type="button" onClick={() => nav({ to: "/admin/proizvodi" })} className="border border-border px-5 py-2.5 rounded-md font-semibold">Odustani</button>
        </div>
      </form>

      <style>{`.input{width:100%;padding:0.625rem 0.875rem;border-radius:0.5rem;border:1px solid var(--color-border);background:var(--color-input);color:var(--color-foreground);outline:none;transition:border-color .15s}.input::placeholder{color:var(--color-muted-foreground)}.input:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in oklab,var(--color-primary) 20%,transparent)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  );
}
