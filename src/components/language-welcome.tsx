import { chooseLanguage, LANGUAGES, useStore } from "@/lib/store";

/** First-visit language choice. Can be changed any time on Ask Noor. */
export function LanguageWelcome() {
  const chosen = useStore((s) => s.languageChosen);
  if (chosen) return null;
  return (
    <section aria-label="Choose your language" className="border-b bg-card p-4">
      <p className="text-base font-semibold">🌍 Which language do you speak?</p>
      <p className="text-xs text-muted-foreground">Noor speaks Swahili. We translate for you both. You can change this later.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {LANGUAGES.map((l) => (
          <button key={l} onClick={() => chooseLanguage(l)} className="min-h-11 rounded-full border bg-background px-4 text-sm font-semibold">{l}</button>
        ))}
      </div>
    </section>
  );
}
