import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-lg">
        <p className="text-secondary text-xs tracking-widest uppercase mb-8">Digital Campfire</p>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6">
          Conversations with<br />strangers that matter
        </h1>
        <p className="text-secondary text-lg mb-12">
          5 people. 15 minutes. One question.<br />Gone when it&apos;s over.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-accent text-black font-medium rounded-xl px-8 py-3 hover:brightness-110 transition-all"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="border border-white/15 text-white rounded-xl px-8 py-3 hover:bg-surface transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}