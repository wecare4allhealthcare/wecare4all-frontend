/**
 * Medicines Delivery settings (Home Healthcare page).
 * Edit this file to change serviceable areas / pincodes - no other code change needed.
 */

// A Home Healthcare service whose category (set in Admin > Home Healthcare
// Services) is one of these opens the Medicines Delivery form instead of the
// normal visit-booking form.
export const MEDICINE_CATEGORIES = ["medicines", "medicine", "pharmacy"];

// The delivery areas + pincodes are managed by the admin (Admin > Home Healthcare >
// "Delivery areas" tab). The lists below are only the FALLBACK used until the admin
// adds the first area.
//
// Areas shown in the drop-down when the admin has not added any area yet.
export const CHENNAI_AREAS = [
  "Adambakkam", "Adyar", "Alandur", "Alwarpet", "Alwarthirunagar", "Ambattur",
  "Anna Nagar", "Arumbakkam", "Ashok Nagar", "Besant Nagar", "Chetpet",
  "Chintadripet", "Chromepet", "Egmore", "Ekkattuthangal", "Gopalapuram",
  "Guindy", "K.K. Nagar", "Kilpauk", "Kodambakkam", "Kolathur", "Korattur",
  "Kotturpuram", "Madipakkam", "Mandaveli", "Medavakkam", "Mogappair",
  "Mylapore", "Nandanam", "Nanganallur", "Nungambakkam", "Padi", "Pallavaram",
  "Pallikaranai", "Perambur", "Perungudi", "Porur", "Purasawalkam",
  "Royapettah", "Royapuram", "Saidapet", "Santhome", "Shenoy Nagar",
  "Sholinganallur", "Sowcarpet", "T. Nagar", "Tambaram", "Teynampet",
  "Thiruvanmiyur", "Thiruvottiyur", "Thoraipakkam", "Tondiarpet", "Triplicane",
  "Vadapalani", "Valasaravakkam", "Velachery", "Villivakkam", "Virugambakkam",
  "Washermanpet", "West Mambalam",
];

// Pincodes accepted when the customer types one. Chennai city pincodes
// are roughly 600001-600130 - CONFIRM against the areas you really serve.
export const CHENNAI_PINCODE_RANGE = { min: 600001, max: 600130 };

// Prescription upload. true = the customer MUST upload a prescription;
// false = a prescription OR a typed medicine list is enough.
export const REQUIRE_PRESCRIPTION = true;
export const MAX_PRESCRIPTION_MB = 5; // keep in sync with the backend (5 MB)
