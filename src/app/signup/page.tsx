import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/AuthForm";
import { signupAction } from "../auth-actions";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mb-6 mt-1.5 text-sm text-ink-muted">
          Track repairs, keep your addresses, and book faster next time.
        </p>
        <SignupForm action={signupAction} />
      </div>
    </div>
  );
}
