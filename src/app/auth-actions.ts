"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalisePhone, isValidPhone } from "@/lib/format";
import { createSession, destroySession, getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";
import { checkRateLimit, rateLimitMessage } from "@/lib/rateLimit";

export type AuthState = { error?: string; message?: string };

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

const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
});

export async function updateProfileAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await getSessionUser();
  if (!session) return { error: "Please sign in again." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.update({
    where: { id: session.id },
    data: { name: parsed.data.name, email: parsed.data.email || null },
  });

  // The session carries the name, so it has to be reissued or the header keeps
  // greeting them by the old one until the cookie expires.
  await createSession({
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
  });

  revalidatePath("/account");
  return { message: "Saved." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(8, "The new password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, {
    message: "The two new passwords don't match",
  });

export async function changePasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await getSessionUser();
  if (!session) return { error: "Please sign in again." };

  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) return { error: "Please sign in again." };

  // The current password is required so that a borrowed, unlocked phone can't
  // be used to lock the real owner out of their own account.
  if (!(await verifyPassword(parsed.data.current, user.password))) {
    return { error: "That isn't your current password." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(parsed.data.next) },
  });

  return { message: "Password changed." };
}
