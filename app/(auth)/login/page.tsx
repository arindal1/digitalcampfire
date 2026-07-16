import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { EmberBackground } from "@/components/EmberBackground";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <EmberBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface/80 p-8 backdrop-blur-sm shadow-sm">
          <p className="mb-4 text-center text-xs uppercase tracking-[0.45em] text-secondary">
            DIGITAL CAMPFIRE
          </p>

          <h1 className="mb-2 text-center text-3xl font-semibold">
            Welcome back.
          </h1>

          <p className="mb-8 text-center text-sm leading-6 text-secondary">
            The fire is still burning.
            <br />
            Rest awhile before continuing your journey.
          </p>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-secondary">
            No account?{" "}
            <Link
              href="/register"
              className="text-accent transition-colors hover:underline"
            >
              Join the campfire
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}