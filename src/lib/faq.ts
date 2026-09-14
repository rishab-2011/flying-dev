/**
 * The questions repair customers actually ask before booking.
 *
 * Kept as data rather than markup so the same list feeds both the page and its
 * FAQPage structured data — Google can then show these answers directly in
 * search results, which is worth more to a new business than the page itself.
 */
export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
  {
    question: "Do you come to my home, or do I have to visit a shop?",
    answer:
      "We come to you. A technician reaches your home or office anywhere we service in Delhi NCR and repairs the phone in front of you, usually within the hour. For motherboard faults and water damage we collect the device, repair it at our workshop and return it to the same address.",
  },
  {
    question: "Will my data be safe? Can you see my photos and messages?",
    answer:
      "We do not open your photos, messages, accounts or files, and we never copy anything off your device. Some repairs — a screen, a camera, a speaker — have to be tested, which needs the phone unlocked, so most customers simply stay with the technician while it happens. Please back up your device before any repair: some faults make data unrecoverable before we ever touch the phone.",
  },
  {
    question: "Is the price on the website the price I pay?",
    answer:
      "It is our estimate for that model and fault, and it is what you pay in the large majority of cases. The technician confirms it after inspecting the device, because the visible symptom is not always the whole fault — a cracked screen can sit on top of a damaged display connector. If the confirmed price differs, we tell you before starting any work and you can cancel at no charge.",
  },
  {
    question: "When do I pay, and how?",
    answer:
      "After the repair is done and you have tested the phone — never before. We take no payment through this website and never ask for an advance to confirm a booking. If anyone asks you for an advance, an OTP, or a transfer to a personal account in our name, it is not us. A GST invoice is issued for every repair.",
  },
  {
    question: "What does the six-month warranty actually cover?",
    answer:
      "The part we replaced and our workmanship, for six months from the day you get the phone back. If the same fault returns, we fix it again free. It does not cover new physical damage, a fresh drop, liquid damage after the repair, or work done by someone else opening the device afterwards. Your booking reference is your warranty record.",
  },
  {
    question: "Are the parts genuine?",
    answer:
      "We use new parts, and where a part comes in more than one grade we tell you which grade is quoted before you agree — the price reflects it. We are an independent repair service, not an authorised service centre, so parts are not sourced from the manufacturer's own channel. Any repair by an independent provider, including us, may affect a remaining manufacturer warranty, and that is your call to make.",
  },
  {
    question: "How long does a repair take?",
    answer:
      "A screen or battery replacement is usually under an hour, done in a single visit. Charging ports and cameras are similar. Water damage and motherboard repairs need the workshop and typically take one to two days, because they involve cleaning, drying and diagnosis before any parts go in.",
  },
  {
    question: "Which areas do you cover?",
    answer:
      "Delhi, Noida, Greater Noida, Ghaziabad, Gurugram and Faridabad — though not every pincode in each. Enter your pincode on the home page and we will tell you straight away, before you spend any time on a booking.",
  },
  {
    question: "My phone model isn't listed. Can you still repair it?",
    answer:
      "Very likely. We list the models we see most, not everything we can fix. Use the 'Request a quote' form with your model and the fault, and we will send you a price on WhatsApp, usually within a few hours.",
  },
  {
    question: "What if the phone can't be repaired?",
    answer:
      "We reassemble it and return it in the condition we received it, so far as that is possible, and you pay nothing beyond any diagnostic fee agreed in advance. Opening a damaged device sometimes reveals further damage nobody could see beforehand — if that happens we explain exactly what we found.",
  },
  {
    question: "Can I cancel or reschedule?",
    answer:
      "Yes, free of charge, any time before the technician starts work. Call or message us on WhatsApp. We only ask that you tell us before our technician has travelled to you.",
  },
  {
    question: "Do I need an account to book?",
    answer:
      "No. Booking takes a name, a number and an address — that is all. You get a booking reference to track the repair. If you create an account later with the same number, past bookings attach to it automatically.",
  },
];
