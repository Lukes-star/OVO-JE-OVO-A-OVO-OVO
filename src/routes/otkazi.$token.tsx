import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/otkazi/$token")({ component: Page });

function Page() {
  const { token } = Route.useParams();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_order_by_token", { _token: token });
      if (error || !data || data.length === 0) setError("Porudžbina nije pronađena ili je link neispravan.");
      else setOrder(data[0]);
      setLoading(false);
    })();
  }, [token]);

  const cancel = async () => {
    setCancelling(true);
    const { data, error } = await supabase.rpc("cancel_order_by_token", { _token: token });
    setCancelling(false);
    if (error) { toast.error(error.message); return; }
    if (!data || data.length === 0) { toast.error("Porudžbina se više ne može otkazati."); return; }
    setOrder({ ...order, status: "otkazano" });
    toast.success("Porudžbina je otkazana");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-xl">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          {loading ? (
            <p className="text-muted-foreground">Učitavanje...</p>
          ) : error ? (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-3" />
              <h1 className="text-2xl font-black mb-2">Greška</h1>
              <p className="text-muted-foreground">{error}</p>
            </>
          ) : order.status === "otkazano" ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-gold mx-auto mb-3" />
              <h1 className="text-2xl font-black mb-2">Porudžbina otkazana</h1>
              <p className="text-muted-foreground">Vaša porudžbina je uspešno otkazana.</p>
            </>
          ) : order.status === "isporuceno" ? (
            <>
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-3" />
              <h1 className="text-2xl font-black mb-2">Već isporučeno</h1>
              <p className="text-muted-foreground">Ova porudžbina je već isporučena i ne može se otkazati.</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black mb-1">Otkazivanje porudžbine</h1>
              <p className="text-muted-foreground mb-4">
                Br. <span className="font-mono text-gold">{String(order.id).slice(0, 8)}</span> · {order.customer_name}
              </p>
              <p className="mb-6">Da li ste sigurni da želite da otkažete ovu porudžbinu?</p>
              <button
                onClick={cancel}
                disabled={cancelling}
                className="bg-destructive text-destructive-foreground font-bold px-6 py-3 rounded-md disabled:opacity-50"
              >
                {cancelling ? "Otkazivanje..." : "Da, otkaži porudžbinu"}
              </button>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
