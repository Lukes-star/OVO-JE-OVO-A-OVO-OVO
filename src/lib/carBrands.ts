// SimpleIcons CDN — reliable SVG car brand logos in gold
const GOLD = "C9A227";
const SI = (slug: string) => `https://cdn.simpleicons.org/${slug}/${GOLD}`;

export const CAR_BRANDS = [
  "AUDI", "BMW", "MERCEDES", "VW", "PORSCHE", "SKODA",
  "SEAT", "FORD", "OPEL", "PEUGEOT", "RENAULT", "FIAT",
  "TOYOTA", "HONDA", "HYUNDAI", "KIA", "MAZDA", "NISSAN",
] as const;
export type CarBrand = (typeof CAR_BRANDS)[number];

// SimpleIcons slugs for each brand
export const BRAND_LOGOS: Record<CarBrand, string> = {
  AUDI:     SI("audi"),
  BMW:      SI("bmw"),
  MERCEDES: SI("mercedesbenz"),
  VW:       SI("volkswagen"),
  PORSCHE:  SI("porsche"),
  SKODA:    SI("skoda"),
  SEAT:     SI("seat"),
  FORD:     SI("ford"),
  OPEL:     SI("opel"),
  PEUGEOT:  SI("peugeot"),
  RENAULT:  SI("renault"),
  FIAT:     SI("fiat"),
  TOYOTA:   SI("toyota"),
  HONDA:    SI("honda"),
  HYUNDAI:  SI("hyundai"),
  KIA:      SI("kia"),
  MAZDA:    SI("mazda"),
  NISSAN:   SI("nissan"),
};
