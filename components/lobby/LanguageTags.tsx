const LANG_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", fr: "French", hi: "Hindi",
  pt: "Portuguese", ar: "Arabic", zh: "Mandarin", ja: "Japanese",
  de: "German", ru: "Russian", bn: "Bengali", kn: "Kannada",
  ml: "Malyalam", mr: "Marathi", ta: "Tamil", te: "Telugu",
  ur: "Urdu", pa: "Punjabi", ko: "Korean", it: "Italian",
  tr: "Turkish", vi: "Vietnamese", id: "Indonesian"
};

export function LanguageTags({ languages }: { languages: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {languages.map((code) => (
        <span key={code} className="px-3 py-1 bg-surface-secondary border border-white/10 rounded-full text-sm text-secondary">
          {LANG_NAMES[code] ?? code}
        </span>
      ))}
    </div>
  );
}