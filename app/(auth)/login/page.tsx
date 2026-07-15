import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-surface border border-white/8 rounded-2xl p-8">
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-secondary text-sm mb-8">Sign in to your account</p>
        <LoginForm />
        <p className="text-secondary text-sm mt-6 text-center">
          No account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}