import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { EmberBackground } from "@/components/EmberBackground";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <EmberBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface/80 p-8 backdrop-blur-sm">
          <h1 className="mb-1 text-2xl font-semibold">Create your account</h1>

          <p className="mb-8 text-sm text-secondary">
            Sit by the fire. Meet fellow travellers.
          </p>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent transition hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}