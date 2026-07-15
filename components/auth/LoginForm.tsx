"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const inputCls =
  "w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-accent transition-shadow";
const btnCls =
  "w-full bg-accent text-black font-medium rounded-xl px-6 py-3 hover:brightness-110 disabled:opacity-50 transition-all";

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email: form.email,
      password: form.password,
      callbackURL: "/lobby",
    });
    if (error) setError(error.message ?? "Login failed");
    else router.push("/lobby");
    setLoading(false);
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="email" placeholder="Email" required value={form.email} onChange={set("email")} className={inputCls} />
      <input type="password" placeholder="Password" required value={form.password} onChange={set("password")} className={inputCls} />
      {error && <p className="text-error text-sm">{error}</p>}
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}