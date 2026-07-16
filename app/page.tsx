import { Metadata } from "next";
import Link from "next/link";
import { LandingAccentText } from "@/components/LandingAccentText";

export const metadata: Metadata = {
  title: "Digital Campfire",
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-white">
      {/* Ember Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

        <div className="embers">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="ember"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <p className="mb-10 text-xs uppercase tracking-[0.45em] text-secondary">
            DIGITAL CAMPFIRE
          </p>

          <h1 className="mb-8 text-5xl font-semibold leading-tight md:text-7xl">
            The road is long.
            <br />
            <LandingAccentText />
          </h1>

          <p className="mx-auto mb-14 max-w-xl text-lg leading-8 text-secondary">
            There are other travellers waiting, join them.
            <br />
            When the fire dies, everyone continues their journey.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-accent px-8 py-3 font-medium text-black transition hover:brightness-110"
            >
              Join the Fire
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/10 px-8 py-3 transition hover:bg-surface"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}