import { Car, Monitor, Disc3, Eye, Lightbulb, MinusCircle, ParkingCircle, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_CATEGORIES = [
  "Auto Body Kitovi","Auto Multimedije","Volani","Stakla za Farove",
  "Xenon Oprema","Led Oprema","Parking Oprema","Sigurnost","Ostala Oprema",
] as const;
export type Category = (typeof DEFAULT_CATEGORIES)[number] | string;

export const CATEGORIES: readonly string[] = DEFAULT_CATEGORIES;

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Auto Body Kitovi": Car, "Auto Multimedije": Monitor, "Volani": Disc3,
  "Stakla za Farove": Eye, "Xenon Oprema": Lightbulb, "Led Oprema": MinusCircle,
  "Parking Oprema": ParkingCircle, "Sigurnost": ShieldCheck, "Ostala Oprema": Wrench,
};

export const CATEGORY_IMAGES: Record<string, string> = {
  "Auto Body Kitovi":  "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
  "Auto Multimedije":  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80",
  "Volani":            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "Stakla za Farove":  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  "Xenon Oprema":      "https://images.unsplash.com/photo-1621279958476-b72f6f801d5e?w=800&q=80",
  "Led Oprema":        "https://images.unsplash.com/photo-1609621838510-5ad474b7d25d?w=800&q=80",
  "Parking Oprema":    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
  "Sigurnost":         "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
  "Ostala Oprema":     "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
};

export const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80";

/** Fetch live categories from DB; falls back to DEFAULT_CATEGORIES */
export function useCategories() {
  return useQuery({
    queryKey: ["site-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error || !data || data.length === 0) return [...DEFAULT_CATEGORIES];
      const visible = data.filter((c: any) => !c.hidden);
      if (visible.length === 0) return [...DEFAULT_CATEGORIES];
      return visible.map((c: any) => c.name) as string[];
    },
    staleTime: 60_000,
  });
}
