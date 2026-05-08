import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
export type CartItem = { id: string; name: string; price: number; image_url?: string | null; quantity: number; };
type CartCtx = { items: CartItem[]; add: (item: Omit<CartItem,"quantity">, qty?: number) => void; remove: (id: string) => void; setQty: (id: string, qty: number) => void; clear: () => void; total: number; count: number; };
const Ctx = createContext<CartCtx | null>(null);
const KEY = "cartech_cart_v1";
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => { try { const r = typeof window!=="undefined"?localStorage.getItem(KEY):null; if(r)setItems(JSON.parse(r)); }catch{} },[]);
  useEffect(() => { if(typeof window!=="undefined")localStorage.setItem(KEY,JSON.stringify(items)); },[items]);
  const add: CartCtx["add"] = (item,qty=1) => setItems(p=>{ const ex=p.find(i=>i.id===item.id); if(ex)return p.map(i=>i.id===item.id?{...i,quantity:i.quantity+qty}:i); return[...p,{...item,quantity:qty}]; });
  const remove=(id:string)=>setItems(p=>p.filter(i=>i.id!==id));
  const setQty=(id:string,qty:number)=>setItems(p=>p.map(i=>i.id===id?{...i,quantity:Math.max(1,qty)}:i));
  const clear=()=>setItems([]);
  const total=items.reduce((s,i)=>s+i.price*i.quantity,0);
  const count=items.reduce((s,i)=>s+i.quantity,0);
  return <Ctx.Provider value={{items,add,remove,setQty,clear,total,count}}>{children}</Ctx.Provider>;
}
export const useCart=()=>{ const c=useContext(Ctx); if(!c)throw new Error("useCart outside provider"); return c; };
export const formatRSD=(n:number)=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",minimumFractionDigits:2}).format(n);
