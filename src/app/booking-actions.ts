"use server";

import { randomInt } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { normalisePhone, isValidPhone } from "@/lib/format";
import { notifyBookingCreated } from "@/lib/notify";

export type BookingState = { error?: string };

// No I, O, 0 or 1 — these get misread when a customer reads a ref over the phone.
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

async function uniqueRef(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) code += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
    const ref = `FD-${code}`;
    if (!(await db.booking.findUnique({ where: { ref } }))) return ref;
  }
  throw new Error("Could not allocate a booking reference");
}

const bookingSchema = z.object({
  modelId: z.string().min(1),
  issueSlugs: z.array(z.string()).min(1, "Select at least one repair"),
  customerName: z.string().trim().min(2, "Please enter your name"),
  customerPhone: z.string().refine(isValidPhone, "Enter a valid 10-digit mobile number"),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  mode: z.enum(["DOORSTEP", "PICKUP_DROP"]),
  addressLine: z.string().trim().min(10, "Please enter a complete address"),
  landmark: z.string().trim().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  slotWindow: z.string().min(1, "Choose a time slot"),
  notes: z.string().trim().max(500).optional(),
});

export async function createBookingAction(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const parsed = bookingSchema.safeParse({
    modelId: formData.get("modelId"),
    issueSlugs: String(formData.get("issueSlugs") ?? "").split(",").filter(Boolean),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail") ?? "",
    mode: formData.get("mode"),
    addressLine: formData.get("addressLine"),
    landmark: formData.get("landmark") ?? "",
    pincode: formData.get("pincode"),
    slotDate: formData.get("slotDate"),
    slotWindow: formData.get("slotWindow"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  const area = await db.serviceArea.findUnique({ where: { pincode: input.pincode } });
  if (!area || !area.active) {
    return { error: `We don't service ${input.pincode} yet. Try another NCR pincode or request a quote.` };
  }
  if (input.mode === "DOORSTEP" && !area.doorstep) {
    return { error: `Doorstep repair isn't available in ${input.pincode}. Choose pickup & drop instead.` };
  }
  if (input.mode === "PICKUP_DROP" && !area.pickupAndDrop) {
    return { error: `Pickup & drop isn't available in ${input.pincode}. Choose doorstep repair instead.` };
  }

  const model = await db.model.findUnique({
    where: { id: input.modelId },
    include: { brand: true },
  });
  if (!model) return { error: "That device is no longer available. Please start again." };

  // Prices are re-read here rather than trusted from the form, so a tampered
  // request can't book a ₹25,000 screen for ₹1.
  const prices = await db.priceItem.findMany({
    where: {
      modelId: model.id,
      active: true,
      issue: { slug: { in: input.issueSlugs } },
    },
    include: { issue: true },
    orderBy: { issue: { rank: "asc" } },
  });

  if (prices.length === 0) {
    return { error: "Those repairs aren't available for this model. Please start again." };
  }

  const total = prices.reduce((sum, p) => sum + p.price, 0);
  const phone = normalisePhone(input.customerPhone);
  const session = await getSessionUser();
  // Link to an account only when the booking is for the signed-in user's number.
  const userId = session && session.phone === phone ? session.id : null;

  const booking = await db.booking.create({
    data: {
      ref: await uniqueRef(),
      status: "REQUESTED",
      userId,
      customerName: input.customerName,
      customerPhone: phone,
      customerEmail: input.customerEmail || null,
      modelId: model.id,
      deviceLabel: `${model.brand.name} ${model.name}`.replace(/^Apple /, ""),
      mode: input.mode,
      addressLine: input.addressLine,
      landmark: input.landmark || null,
      pincode: input.pincode,
      city: area.city,
      slotDate: input.slotDate,
      slotWindow: input.slotWindow,
      notes: input.notes || null,
      totalAmount: total,
      warrantyMonths: Math.min(...prices.map((p) => p.warrantyMonths)),
      items: {
        create: prices.map((p) => ({ issueName: p.issue.name, price: p.price })),
      },
    },
    include: { items: true },
  });

  await notifyBookingCreated(booking);

  redirect(`/track/${booking.ref}?new=1`);
}

const quoteSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  phone: z.string().refine(isValidPhone, "Enter a valid 10-digit mobile number"),
  deviceText: z.string().trim().min(2, "Tell us which phone you have"),
  issueText: z.string().trim().min(3, "Tell us what's wrong with it"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode").optional().or(z.literal("")),
});

export type QuoteState = { error?: string; done?: boolean };

export async function createQuoteRequestAction(
  _prev: QuoteState,
  formData: FormData
): Promise<QuoteState> {
  const parsed = quoteSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    deviceText: formData.get("deviceText"),
    issueText: formData.get("issueText"),
    pincode: formData.get("pincode") ?? "",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.quoteRequest.create({
    data: {
      name: parsed.data.name,
      phone: normalisePhone(parsed.data.phone),
      deviceText: parsed.data.deviceText,
      issueText: parsed.data.issueText,
      pincode: parsed.data.pincode || null,
    },
  });

  return { done: true };
}
