import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForm";
import { loginAction } from "../auth-actions";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mb-6 mt-1.5 text-sm text-ink-muted">
          Sign in to see your bookings and repair history.
        </p>
        <LoginForm action={loginAction} />
      </div>
    </div>
  );
}
