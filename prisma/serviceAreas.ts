/**
 * Pincodes Flying Dev travels to at launch. Delhi NCR only.
 *
 * VERIFY THIS LIST against the areas you can actually reach within a slot
 * before going live — a booking taken for a pincode you can't service costs
 * you a cancellation and a bad review.
 */
export type AreaSeed = { pincode: string; city: string; area: string };

export const SERVICE_AREAS: AreaSeed[] = [
  // Delhi
  { pincode: "110001", city: "Delhi", area: "Connaught Place" },
  { pincode: "110009", city: "Delhi", area: "GTB Nagar" },
  { pincode: "110016", city: "Delhi", area: "Hauz Khas" },
  { pincode: "110017", city: "Delhi", area: "Malviya Nagar" },
  { pincode: "110018", city: "Delhi", area: "Subhash Nagar" },
  { pincode: "110019", city: "Delhi", area: "Kalkaji" },
  { pincode: "110024", city: "Delhi", area: "Lajpat Nagar" },
  { pincode: "110025", city: "Delhi", area: "Jamia Nagar" },
  { pincode: "110027", city: "Delhi", area: "Rajouri Garden" },
  { pincode: "110034", city: "Delhi", area: "Ashok Vihar" },
  { pincode: "110052", city: "Delhi", area: "Shalimar Bagh" },
  { pincode: "110058", city: "Delhi", area: "Janakpuri" },
  { pincode: "110063", city: "Delhi", area: "Paschim Vihar" },
  { pincode: "110065", city: "Delhi", area: "East of Kailash" },
  { pincode: "110070", city: "Delhi", area: "Vasant Kunj" },
  { pincode: "110075", city: "Delhi", area: "Dwarka" },
  { pincode: "110085", city: "Delhi", area: "Rohini" },
  { pincode: "110091", city: "Delhi", area: "Mayur Vihar" },
  { pincode: "110092", city: "Delhi", area: "Shahdara" },
  { pincode: "110096", city: "Delhi", area: "Mayur Vihar Phase 3" },

  // Noida & Greater Noida
  { pincode: "201301", city: "Noida", area: "Sector 1-30" },
  { pincode: "201303", city: "Noida", area: "Sector 44-50" },
  { pincode: "201304", city: "Noida", area: "Sector 62-63" },
  { pincode: "201305", city: "Noida", area: "Sector 75-78" },
  { pincode: "201306", city: "Noida", area: "Sector 100-110" },
  { pincode: "201309", city: "Noida", area: "Sector 135-142" },
  { pincode: "201313", city: "Greater Noida", area: "Alpha & Beta" },
  { pincode: "201310", city: "Greater Noida", area: "Knowledge Park" },
  { pincode: "201308", city: "Greater Noida", area: "Greater Noida West" },

  // Ghaziabad
  { pincode: "201001", city: "Ghaziabad", area: "Ghaziabad City" },
  { pincode: "201002", city: "Ghaziabad", area: "Kavi Nagar" },
  { pincode: "201005", city: "Ghaziabad", area: "Raj Nagar" },
  { pincode: "201009", city: "Ghaziabad", area: "Vasundhara" },
  { pincode: "201010", city: "Ghaziabad", area: "Vaishali" },
  { pincode: "201012", city: "Ghaziabad", area: "Indirapuram" },
  { pincode: "201014", city: "Ghaziabad", area: "Crossings Republik" },
  { pincode: "201016", city: "Ghaziabad", area: "Sahibabad" },

  // Gurugram
  { pincode: "122001", city: "Gurugram", area: "Gurugram City" },
  { pincode: "122002", city: "Gurugram", area: "DLF Phase 1-3" },
  { pincode: "122003", city: "Gurugram", area: "Sushant Lok" },
  { pincode: "122004", city: "Gurugram", area: "Sector 14-17" },
  { pincode: "122009", city: "Gurugram", area: "Sector 45-48" },
  { pincode: "122011", city: "Gurugram", area: "Sector 55-57" },
  { pincode: "122017", city: "Gurugram", area: "Sector 66-68" },
  { pincode: "122018", city: "Gurugram", area: "Sector 49-52" },
  { pincode: "122022", city: "Gurugram", area: "Golf Course Extn" },
  { pincode: "122051", city: "Gurugram", area: "Sector 82-86" },

  // Faridabad
  { pincode: "121001", city: "Faridabad", area: "Faridabad City" },
  { pincode: "121002", city: "Faridabad", area: "NIT Faridabad" },
  { pincode: "121003", city: "Faridabad", area: "Sector 15-19" },
  { pincode: "121004", city: "Faridabad", area: "Ballabgarh" },
  { pincode: "121005", city: "Faridabad", area: "Sector 21-23" },
  { pincode: "121006", city: "Faridabad", area: "Sector 28-31" },
  { pincode: "121007", city: "Faridabad", area: "Sector 37-46" },
  { pincode: "121010", city: "Faridabad", area: "Sector 81-89" },
];
