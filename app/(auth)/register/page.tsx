import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-surface border border-white/8 rounded-2xl p-8">
        <h1 className="text-2xl font-semibold mb-1">Create account</h1>
        <p className="text-secondary text-sm mb-8">Join the campfire</p>
        <RegisterForm />
        <p className="text-secondary text-sm mt-6 text-center">
          Have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}