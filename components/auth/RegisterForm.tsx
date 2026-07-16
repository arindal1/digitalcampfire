"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "hi", label: "Hindi" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Mandarin" },
  { code: "ja", label: "Japanese" },
  { code: "de", label: "German" },
  { code: "ru", label: "Russian" },
  { code: "bn", label: "Bengali" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "ur", label: "Urdu" },
  { code: "pa", label: "Punjabi" },
  { code: "ko", label: "Korean" },
  { code: "it", label: "Italian" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
  { code: "id", label: "Indonesian" },
];

const GENDERS = [
  { value: "male",   label: "Male" },
  { value: "female", label: "Female" },
  { value: "other",  label: "Other" },
];

const inputCls =
  "w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-accent transition-shadow";
const btnCls =
  "w-full bg-accent text-black font-medium rounded-xl px-6 py-3 hover:brightness-110 disabled:opacity-50 transition-all";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", age: "" });
  const [gender, setGender] = useState("");
  const [langs, setLangs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (code: string) =>
    setLangs((prev) => (prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]));

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const age = parseInt(form.age, 10);
    if (isNaN(age) || age < 18) {
      setError("You must be 18 or older to use Digital Campfire.");
      return;
    }
    if (!gender) { setError("Please select a gender."); return; }
    if (langs.length === 0) { setError("Select at least one language."); return; }

    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (authClient.signUp.email as any)({
      name: form.username,
      email: form.email,
      password: form.password,
      username: form.username,
      languages: JSON.stringify(langs),
      age,
      gender,
    });
    if (error) setError(error.message ?? "Registration failed");
    else router.push("/lobby");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        placeholder="Username" required minLength={3} maxLength={20}
        value={form.username} onChange={set("username")} className={inputCls}
      />
      <input
        type="email" placeholder="Email" required
        value={form.email} onChange={set("email")} className={inputCls}
      />
      <input
        type="password" placeholder="Password" required minLength={8}
        value={form.password} onChange={set("password")} className={inputCls}
      />
      <p className="text-secondary/55 text-xs ml-1">
        No "forgot password" yet - don't let the fire go out in your memory.
      </p>

      {/* Age & Gender */}
      <div className="flex flex-col gap-3 p-4 bg-surface-secondary rounded-xl border border-white/10">
        <p className="text-secondary text-xs leading-relaxed">
          Your age and gender are used only for safety verification and are{" "}
          <span className="text-white/70 font-medium">never shown or shared</span> with other users.
        </p>
        <input
          type="number" placeholder="Age" required min={18} max={120}
          value={form.age} onChange={set("age")}
          className={inputCls}
        />
        <div>
          <p className="text-secondary text-sm mb-2">Gender</p>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.value} type="button" onClick={() => setGender(g.value)}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  gender === g.value
                    ? "bg-accent text-black"
                    : "bg-surface text-secondary hover:text-white border border-white/10"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-secondary text-sm mb-3">Spoken languages</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code} type="button" onClick={() => toggle(lang.code)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                langs.includes(lang.code)
                  ? "bg-accent text-black"
                  : "bg-surface-secondary text-secondary hover:text-white border border-white/10"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-error text-sm">{error}</p>}
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}