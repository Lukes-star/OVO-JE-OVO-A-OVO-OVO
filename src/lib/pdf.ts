import jsPDF from "jspdf";
import { formatRSD } from "./cart";

export function generateInvoicePDF(order: any) {
  const doc = new jsPDF();
  const items = order.order_items ?? [];

  doc.setFontSize(22);
  doc.setTextColor(180, 140, 30);
  doc.text("CAR-TECH RS", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Auto oprema i tjuning delovi", 14, 26);

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("RACUN / POTVRDA PORUDZBINE", 14, 42);

  doc.setFontSize(10);
  doc.text(`Broj: ${String(order.id).slice(0, 8).toUpperCase()}`, 14, 50);
  doc.text(`Datum: ${new Date(order.created_at).toLocaleString("sr-RS")}`, 14, 56);
  doc.text(`Status: ${order.status}`, 14, 62);

  doc.setFontSize(11);
  doc.text("Kupac:", 14, 76);
  doc.setFontSize(10);
  doc.text(order.customer_name, 14, 82);
  doc.text(`Tel: ${order.phone}`, 14, 88);
  doc.text(`Email: ${order.email}`, 14, 94);
  doc.text(`Adresa: ${order.address}`, 14, 100);
  doc.text(`${order.postal_code} ${order.city}`, 14, 106);

  let y = 122;
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y - 6, 182, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Proizvod", 16, y - 1);
  doc.text("Kol.", 130, y - 1);
  doc.text("Cena", 150, y - 1);
  doc.text("Ukupno", 175, y - 1);
  doc.setFont("helvetica", "normal");

  y += 6;
  for (const it of items) {
    const name = String(it.product_name).slice(0, 60);
    doc.text(name, 16, y);
    doc.text(String(it.quantity), 130, y);
    doc.text(formatRSD(Number(it.price)), 150, y);
    doc.text(formatRSD(Number(it.price) * it.quantity), 175, y);
    y += 7;
  }

  y += 4;
  doc.setDrawColor(200);
  doc.line(14, y, 196, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("UKUPNO:", 130, y);
  doc.text(formatRSD(Number(order.total)), 175, y);

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Nacin placanja: Pouzecem prilikom isporuke", 14, y);
  if (order.note) doc.text(`Napomena: ${order.note}`, 14, y + 6);

  doc.text("Hvala vam na poverenju! - Car-Tech RS", 14, 280);

  doc.save(`racun-${String(order.id).slice(0, 8)}.pdf`);
}
