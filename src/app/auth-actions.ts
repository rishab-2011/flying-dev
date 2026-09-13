"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalisePhone, isValidPhone } from "@/lib/format";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { checkRateLimit, rateLimitMessage } from "@/lib/rateLimit";

export type AuthState = { error?: string };

const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  phone: z.string().refine(isValidPhone, "Enter a valid 10-digit mobile number"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signupAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const limit = await checkRateLimit("signup");
  if (!limit.allowed) return { error: rateLimitMessage(limit) };

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const phone = normalisePhone(parsed.data.phone);
  const existing = await db.user.findUnique({ where: { phone } });
  if (existing) {
    return { error: "An account with this number already exists. Sign in instead." };
  }

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      phone,
      email: parsed.data.email || null,
      password: await hashPassword(parsed.data.password),
      role: "CUSTOMER",
    },
  });

  // Any bookings already placed with this number belong to the new account.
  await db.booking.updateMany({
    where: { customerPhone: phone, userId: null },
    data: { userId: user.id },
  });

  await createSession({ id: user.id, name: user.name, phone: user.phone, role: "CUSTOMER" });
  redirect("/account");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const phone = normalisePhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!isValidPhone(phone) || !password) {
    return { error: "Enter your mobile number and password" };
  }

  // Checked before the password comparison: bcrypt is deliberately slow, so an
  // unlimited login endpoint is both a brute-force hole and a way to tie up the
  // server with expensive work.
  const limit = await checkRateLimit("login", phone);
  if (!limit.allowed) return { error: rateLimitMessage(limit) };

  const user = await db.user.findUnique({ where: { phone } });
  // One message for both cases, so this can't be used to discover who has an account.
  if (!user || !(await verifyPassword(password, user.password))) {
    return { error: "Incorrect mobile number or password" };
  }

  await createSession({
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
  });

  redirect(user.role === "ADMIN" ? "/admin" : "/account");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
