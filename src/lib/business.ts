/**
 * The business's own details, in one place.
 *
 * Structured data is where a search engine takes what the site says about the
 * business at face value, so nothing here is invented. The address and legal
 * name are omitted entirely until they are supplied — an approximate address in
 * schema.org markup is worse than none, because Google will place the business
 * on a map at it and customers will turn up there.
 */
export const BUSINESS = {
  name: "Flying Dev",
  /** Falls back to the number the site displays everywhere else. */
  get phone() {
    return process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 85879 49104";
  },
  get url() {
    return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  },
  /** Set BUSINESS_STREET_ADDRESS etc. once the registered address is settled. */
  get address() {
    const street = process.env.BUSINESS_STREET_ADDRESS;
    const locality = process.env.BUSINESS_LOCALITY;
    const postalCode = process.env.BUSINESS_POSTAL_CODE;
    if (!street || !locality || !postalCode) return null;

    return {
      "@type": "PostalAddress" as const,
      streetAddress: street,
      addressLocality: locality,
      postalCode,
      addressRegion: process.env.BUSINESS_REGION || "Delhi",
      addressCountry: "IN",
    };
  },
  cities: [
    "Delhi",
    "Noida",
    "Greater Noida",
    "Ghaziabad",
    "Gurugram",
    "Faridabad",
  ],
  /** Two-hour slots, 10:00 to 20:00, which is what the booking form offers. */
  opens: "10:00",
  closes: "20:00",
} as const;
