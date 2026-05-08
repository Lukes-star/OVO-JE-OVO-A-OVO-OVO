import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Trash2, Tag, Image, AlertCircle, Pencil, Check, X, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_CATEGORIES, CATEGORY_IMAGES, DEFAULT_CATEGORY_IMAGE } from "@/lib/categories";

export const Route = createFileRoute("/admin/kategorije")({ component: Page });

type CatRow = { id: string; name: string; image_url: string | null; sort_order: number; hidden?: boolean };

function Page() {
  const qc = useQueryClient();
  const [tableExists, setTableExists] = useState(true);

  const [newName,  setNewName]  = useState("");
  const [newImg,   setNewImg]   = useState("");
  const [adding,   setAdding]   = useState(false);

  const [editId,   setEditId]   = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImg,  setEditImg]  = useState("");
  const [saving,   setSaving]   = useState(false);

  const [bEditName, setBEditName] = useState<string | null>(null);
  const [bEditImg,  setBEditImg]  = useState("");
  const [bSaving,   setBSaving]   = useState(false);

  const { data: dbCats = [], isLoading } = useQuery<CatRow[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories").select("*").order("sort_order", { ascending: true });
      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          setTableExists(false); return [];
        }
        toast.error(error.message); return [];
      }
      return (data ?? []) as CatRow[];
    },
  });

  const byName: Record<string, CatRow> = {};
  for (const c of dbCats) byName[c.name] = c;

  const customCats = dbCats.filter(c => !(DEFAULT_CATEGORIES as readonly string[]).includes(c.name));
  const visibleBuiltins = DEFAULT_CATEGORIES.filter(n => !byName[n]?.hidden);
  const hiddenBuiltins  = DEFAULT_CATEGORIES.filter(n => byName[n]?.hidden);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["site-categories"] });
  };

  /* ADD custom */
  const addCategory = async () => {
    if (!newName.trim()) { toast.error("Unesite naziv"); return; }
    setAdding(true);
    const max = (dbCats.reduce((m, c) => Math.max(m, c.sort_order ?? 0), 0)) + 1;
    const { error } = await supabase.from("categories").insert({ name: newName.trim(), image_url: newImg.trim() || null, sort_order: max });
    if (error) toast.error(error.message);
    else { toast.success("Kategorija dodana"); setNewName(""); setNewImg(""); refresh(); }
    setAdding(false);
  };

  /* SAVE edit (custom) */
  const saveEdit = async () => {
    if (!editId || !editName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("categories").update({ name: editName.trim(), image_url: editImg.trim() || null }).eq("id", editId);
    if (error) toast.error(error.message);
    else { toast.success("Sačuvano"); setEditId(null); refresh(); }
    setSaving(false);
  };

  /* DELETE custom */
  const removeCustom = async (id: string, name: string) => {
    if (!confirm(`Obrisati kategoriju "${name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Obrisano"); refresh(); }
  };

  /* HIDE builtin (upsert with hidden:true) */
  const hideBuiltin = async (name: string) => {
    if (!confirm(`Sakriti kategoriju "${name}"? Neće se prikazivati na sajtu.`)) return;
    const existing = byName[name];
    const max = (dbCats.reduce((m, c) => Math.max(m, c.sort_order ?? 0), 0)) + 1;
    const payload = { name, hidden: true, image_url: existing?.image_url ?? null, sort_order: existing?.sort_order ?? max };
    const { error } = existing
      ? await supabase.from("categories").update({ hidden: true }).eq("id", existing.id)
      : await supabase.from("categories").insert(payload);
    if (error) {
      if (error.message?.includes("hidden")) {
        toast.error("Dodajte kolonu 'hidden boolean default false' u tabelu categories u Supabase-u.");
      } else toast.error(error.message);
    } else { toast.success(`"${name}" sakrivena`); refresh(); }
  };

  /* RESTORE hidden builtin */
  const restoreBuiltin = async (name: string) => {
    const existing = byName[name];
    if (!existing) return;
    const { error } = await supabase.from("categories").update({ hidden: false }).eq("id", existing.id);
    if (error) toast.error(error.message);
    else { toast.success(`"${name}" vraćena`); refresh(); }
  };

  /* SAVE builtin image override */
  const saveBuiltinImg = async (name: string) => {
    setBSaving(true);
    const existing = byName[name];
    const max = (dbCats.reduce((m, c) => Math.max(m, c.sort_order ?? 0), 0)) + 1;
    const payload = { name, image_url: bEditImg.trim() || null, sort_order: existing?.sort_order ?? max, hidden: false };
    const { error } = existing
      ? await supabase.from("categories").update(payload).eq("id", existing.id)
      : await supabase.from("categories").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Slika ažurirana"); setBEditName(null); setBEditImg(""); refresh(); }
    setBSaving(false);
  };

  return (
    <div className="max-w-2xl anim-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Kategorije</h1>
        <p className="text-muted-foreground text-sm mt-1">Upravljajte kategorijama proizvoda</p>
      </div>

      {/* SQL notice */}
      {!tableExists && (
        <div className="mb-6 bg-amber-400/10 border border-amber-400/30 rounded-2xl p-5 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-400 text-sm">Pokrenite SQL u Supabase SQL Editor-u:</p>
            <pre className="mt-2 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-green-300 overflow-x-auto whitespace-pre">{`create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  image_url text,
  hidden boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);
alter table categories enable row level security;
create policy "Public read" on categories for select using (true);
create policy "Admin write" on categories for all
  using (auth.role() = 'authenticated');`}</pre>
            <p className="text-xs text-amber-300/70 mt-2">Ako tabela već postoji, dodajte kolonu: <code className="bg-black/30 px-1 rounded">alter table categories add column if not exists hidden boolean default false;</code></p>
          </div>
        </div>
      )}

      {/* ADD */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-5">
        <h2 className="font-black text-sm mb-4 flex items-center gap-2 uppercase tracking-wider text-gold">
          <Plus className="h-4 w-4" /> Dodaj novu kategoriju
        </h2>
        <div className="space-y-3">
          <AInput label="Naziv *" value={newName} onChange={setNewName}
            placeholder="npr. Gume i Felne"
            onEnter={addCategory} />
          <ImgField label="Slika (URL)" value={newImg} onChange={setNewImg} />
          <button onClick={addCategory} disabled={adding || !tableExists}
            className="bg-gold text-gold-foreground font-black px-4 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-40 flex items-center gap-2 text-sm">
            <Plus className="h-3.5 w-3.5" /> {adding ? "Dodavanje..." : "Dodaj kategoriju"}
          </button>
        </div>
      </div>

      {/* BUILTINS */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ugrađene kategorije</p>
          <span className="text-xs text-muted-foreground">{visibleBuiltins.length} vidljivo · {hiddenBuiltins.length} skriveno</span>
        </div>

        {DEFAULT_CATEGORIES.map(name => {
          const row = byName[name];
          const hidden = row?.hidden === true;
          const imgSrc = row?.image_url ?? CATEGORY_IMAGES[name] ?? DEFAULT_CATEGORY_IMAGE;
          const isEditing = bEditName === name;

          return (
            <div key={name} className={`border-t border-white/[0.04] first:border-0 ${hidden ? "opacity-40" : ""}`}>
              <div className="px-5 py-3.5 flex items-center gap-3 group hover:bg-white/[0.02] transition">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5">
                  <img src={imgSrc} alt={name} className="w-full h-full object-cover"
                    onError={e => ((e.target as HTMLImageElement).src = DEFAULT_CATEGORY_IMAGE)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {hidden ? "🚫 Skrivena" : row?.image_url ? "Prilagođena slika" : "Podrazumevana slika"}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  {!hidden && (
                    <button onClick={() => { setBEditName(name); setBEditImg(row?.image_url ?? ""); }}
                      title="Promeni sliku"
                      className="p-1.5 rounded-lg hover:bg-white/8 text-muted-foreground hover:text-gold transition">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {hidden ? (
                    <button onClick={() => restoreBuiltin(name)} title="Vrati"
                      className="p-1.5 rounded-lg hover:bg-green-500/15 text-muted-foreground hover:text-green-400 transition text-xs font-bold px-2">
                      Vrati
                    </button>
                  ) : (
                    <button onClick={() => hideBuiltin(name)} title="Sakrij sa sajta"
                      className="p-1.5 rounded-lg hover:bg-red-500/15 text-muted-foreground hover:text-red-400 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="px-5 pb-4 bg-white/[0.02] border-t border-white/5 pt-3 space-y-3">
                  <ImgField label="Nova slika (URL)" value={bEditImg} onChange={setBEditImg} />
                  <div className="flex gap-2">
                    <button onClick={() => saveBuiltinImg(name)} disabled={bSaving}
                      className="inline-flex items-center gap-1.5 bg-gold text-gold-foreground font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition">
                      <Check className="h-3.5 w-3.5" /> {bSaving ? "Čuvanje..." : "Sačuvaj"}
                    </button>
                    <button onClick={() => setBEditName(null)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-foreground transition">
                      Odustani
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CUSTOM */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vaše kategorije</p>
          <span className="text-xs text-gold font-bold">{customCats.length}</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Učitavanje...</div>
        ) : customCats.length === 0 ? (
          <div className="p-10 text-center">
            <Tag className="h-7 w-7 mx-auto mb-2 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">Nema dodatnih kategorija.</p>
          </div>
        ) : customCats.map(cat => (
          <div key={cat.id} className="border-t border-white/[0.04] first:border-0">
            <div className="px-5 py-3.5 flex items-center gap-3 group hover:bg-white/[0.02] transition">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5">
                {cat.image_url
                  ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Image className="h-3.5 w-3.5 text-muted-foreground" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{cat.name}</p>
                {cat.image_url && <p className="text-[10px] text-muted-foreground truncate">{cat.image_url}</p>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditImg(cat.image_url ?? ""); }}
                  className="p-1.5 rounded-lg hover:bg-white/8 text-muted-foreground hover:text-gold transition">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => removeCustom(cat.id, cat.name)}
                  className="p-1.5 rounded-lg hover:bg-red-500/15 text-muted-foreground hover:text-red-400 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {editId === cat.id && (
              <div className="px-5 pb-4 bg-white/[0.02] border-t border-white/5 pt-3 space-y-3">
                <AInput label="Naziv" value={editName} onChange={setEditName} />
                <ImgField label="Slika (URL)" value={editImg} onChange={setEditImg} />
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="inline-flex items-center gap-1.5 bg-gold text-gold-foreground font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition">
                    <Check className="h-3.5 w-3.5" /> {saving ? "Čuvanje..." : "Sačuvaj"}
                  </button>
                  <button onClick={() => setEditId(null)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-foreground transition">
                    Odustani
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .a-label{display:block;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.13em;color:var(--color-muted-foreground);margin-bottom:.375rem}
        .a-input{width:100%;padding:.6rem .8rem;border-radius:.75rem;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--color-foreground);outline:none;transition:border-color .15s;font-size:.875rem}
        .a-input::placeholder{color:var(--color-muted-foreground)}
        .a-input:focus{border-color:oklch(0.78 0.16 75);box-shadow:0 0 0 3px oklch(0.78 0.16 75/.15)}
      `}</style>
    </div>
  );
}

function AInput({ label, value, onChange, placeholder, onEnter }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; onEnter?: () => void }) {
  return (
    <div>
      <label className="a-label">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className="a-input"
        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), onEnter?.())} />
    </div>
  );
}

function ImgField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="a-label">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder="https://images.unsplash.com/photo-...?w=800" className="a-input" />
      {value && (
        <div className="mt-2 h-20 rounded-xl overflow-hidden border border-white/10 bg-white/5">
          <img src={value} alt="preview" className="w-full h-full object-cover"
            onError={e => ((e.target as HTMLImageElement).style.opacity = "0.15")} />
        </div>
      )}
    </div>
  );
}
