const LANG_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", fr: "French", hi: "Hindi",
  pt: "Portuguese", ar: "Arabic", zh: "Mandarin", ja: "Japanese",
  de: "German", ru: "Russian",
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