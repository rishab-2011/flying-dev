import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/AuthForm";
import { AuthLayout } from "@/components/AuthLayout";
import { signupAction } from "../auth-actions";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Keep your repair history and warranty in one place, and book faster next time."
    >
      <SignupForm action={signupAction} />
    </AuthLayout>
  );
}
