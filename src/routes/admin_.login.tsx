import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin_/login")({ component: Page });

function Page() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@car-tech.rs");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav({ to: "/admin" }); });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Nalog kreiran. Možete se prijaviti.");
      setMode("login");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); setLoading(false); return; }
      nav({ to: "/admin" });
    }
    setLoading(false);
  };

  return (
    <div className="admin-theme min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Car-Tech" className="h-14" />
          <h1 className="text-xl font-bold mt-3">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">{mode === "login" ? "Prijavite se" : "Napravite admin nalog"}</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="text-sm font-medium">Šifra</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background outline-none focus:border-foreground" />
          </div>
          <button disabled={loading} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-md disabled:opacity-50">
            {loading ? "..." : mode === "login" ? "Prijavi se" : "Registruj se"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="w-full text-sm text-muted-foreground mt-4 hover:text-foreground">
          {mode === "login" ? "Prvi put? Napravi admin nalog" : "Već imaš nalog? Prijavi se"}
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground mt-6 hover:text-foreground">← Nazad na sajt</Link>
      </div>
    </div>
  );
}
