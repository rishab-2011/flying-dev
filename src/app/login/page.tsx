import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForm";
import { AuthLayout } from "@/components/AuthLayout";
import { loginAction } from "../auth-actions";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see your repairs, past bookings and warranty records."
    >
      <LoginForm action={loginAction} />
    </AuthLayout>
  );
}
