export function PromptBanner({ prompt }: { prompt: string }) {
  return (
    <p className="text-white text-sm md:text-base font-medium text-center leading-snug">
      {prompt}
    </p>
  );
}