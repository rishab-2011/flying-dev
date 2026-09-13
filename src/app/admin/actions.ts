"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { notifyStatusChanged } from "@/lib/notify";
import { BOOKING_STATUSES } from "@/lib/format";

export type AdminState = { error?: string; message?: string };

/** Wraps an admin action so a missing session becomes a message, not a crash. */
async function guard<T>(fn: () => Promise<T>): Promise<T | AdminState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "You need to be signed in as an admin." };
  }
  return fn();
}

export async function updateBookingStatusAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  return guard(async () => {
    const bookingId = String(formData.get("bookingId") ?? "");
    const status = String(formData.get("status") ?? "");

    if (!BOOKING_STATUSES.includes(status)) return { error: "Unknown status." };

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: { status },
      include: { items: true },
    });

    // Queue the customer message for this transition. REQUESTED is the initial
    // state, so it never produces an update message.
    if (status !== "REQUESTED") await notifyStatusChanged(booking);

    revalidatePath("/admin/bookings");
    revalidatePath(`/track/${booking.ref}`);
    return { message: `${booking.ref} moved to ${status.toLowerCase().replace("_", " ")}.` };
  }) as Promise<AdminState>;
}

export async function saveAdminNoteAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  return guard(async () => {
    const bookingId = String(formData.get("bookingId") ?? "");
    const adminNote = String(formData.get("adminNote") ?? "").slice(0, 1000);

    await db.booking.update({ where: { id: bookingId }, data: { adminNote } });
    revalidatePath("/admin/bookings");
    return { message: "Note saved." };
  }) as Promise<AdminState>;
}

const priceSchema = z.object({
  priceId: z.string().min(1),
  price: z.coerce.number().int().min(0).max(200000),
  strikePrice: z.coerce.number().int().min(0).max(300000).optional(),
  etaMinutes: z.coerce.number().int().min(5).max(20160),
  warrantyMonths: z.coerce.number().int().min(0).max(36),
  active: z.boolean(),
});

export async function updatePriceAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  return guard(async () => {
    const parsed = priceSchema.safeParse({
      priceId: formData.get("priceId"),
      price: formData.get("price"),
      strikePrice: formData.get("strikePrice") || undefined,
      etaMinutes: formData.get("etaMinutes"),
      warrantyMonths: formData.get("warrantyMonths"),
      active: formData.get("active") === "on",
    });

    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { priceId, strikePrice, ...rest } = parsed.data;

    await db.priceItem.update({
      where: { id: priceId },
      // A strike price at or below the real price would render a nonsense
      // discount badge, so it is dropped rather than stored.
      data: { ...rest, strikePrice: strikePrice && strikePrice > rest.price ? strikePrice : null },
    });

    revalidatePath("/admin/prices");
    return { message: "Price updated." };
  }) as Promise<AdminState>;
}

/**
 * Splits one CSV line, honouring the double-quoted fields the export writes
 * (a doubled "" inside a quoted field is a literal quote).
 */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim());
  return cells;
}

/**
 * Bulk price import. Expects a CSV with a header row and the columns
 * brand,model,issue,price — matching the export from this page. Rows whose
 * brand/model/issue can't be matched are reported back rather than guessed at.
 */
export async function importPricesAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  return guard(async () => {
    const csv = String(formData.get("csv") ?? "").trim();
    if (!csv) return { error: "Paste some CSV first." };

    const lines = csv.split(/\r?\n/).filter((line) => line.trim());
    const header = lines[0].toLowerCase();
    if (!header.includes("brand") || !header.includes("price")) {
      return { error: "First row must be a header: brand,model,issue,price" };
    }

    let updated = 0;
    const failures: string[] = [];

    for (const line of lines.slice(1)) {
      const [brand, model, issue, price] = parseCsvLine(line);
      const amount = Number(price);

      if (!brand || !model || !issue || !Number.isFinite(amount)) {
        failures.push(line);
        continue;
      }

      const row = await db.priceItem.findFirst({
        where: {
          model: { name: model, brand: { name: brand } },
          issue: { name: issue },
        },
      });

      if (!row) {
        failures.push(line);
        continue;
      }

      await db.priceItem.update({
        where: { id: row.id },
        data: { price: Math.round(amount) },
      });
      updated++;
    }

    revalidatePath("/admin/prices");

    if (failures.length) {
      return {
        message: `Updated ${updated} prices. ${failures.length} rows didn't match and were skipped: ${failures
          .slice(0, 3)
          .join(" | ")}${failures.length > 3 ? " …" : ""}`,
      };
    }
    return { message: `Updated ${updated} prices.` };
  }) as Promise<AdminState>;
}

export async function toggleServiceAreaAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  return guard(async () => {
    const id = String(formData.get("areaId") ?? "");
    const area = await db.serviceArea.findUnique({ where: { id } });
    if (!area) return { error: "Pincode not found." };

    await db.serviceArea.update({ where: { id }, data: { active: !area.active } });
    revalidatePath("/admin/areas");
    return { message: `${area.pincode} is now ${area.active ? "off" : "on"}.` };
  }) as Promise<AdminState>;
}

const areaSchema = z.object({
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  city: z.string().trim().min(2, "Enter a city"),
  area: z.string().trim().min(2, "Enter an area name"),
});

export async function addServiceAreaAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  return guard(async () => {
    const parsed = areaSchema.safeParse({
      pincode: formData.get("pincode"),
      city: formData.get("city"),
      area: formData.get("area"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const existing = await db.serviceArea.findUnique({
      where: { pincode: parsed.data.pincode },
    });
    if (existing) return { error: `${parsed.data.pincode} is already on the list.` };

    await db.serviceArea.create({ data: parsed.data });
    revalidatePath("/admin/areas");
    return { message: `Added ${parsed.data.pincode}.` };
  }) as Promise<AdminState>;
}

export async function markQuoteHandledAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  return guard(async () => {
    const id = String(formData.get("quoteId") ?? "");
    await db.quoteRequest.update({ where: { id }, data: { handled: true } });
    revalidatePath("/admin/quotes");
    return { message: "Marked as handled." };
  }) as Promise<AdminState>;
}
