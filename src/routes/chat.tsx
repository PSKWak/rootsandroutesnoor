import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Volume2, Loader2, ArrowDown } from "lucide-react";
import noor from "@/assets/noor.jpg";
import { AudioPlayer, MsgBadge, Recorder, Shell, useOnline } from "@/components/rooted";
import { LANGUAGES, REPLY_TIME, SUGGESTED, retryMessage, sendVisitorMessage, setVisitorLanguage, useStore } from "@/lib/store";
import { speakTranslation } from "@/lib/voice.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Roots & Routes — Ask Noor" },
      { name: "description", content: "Ask Noor a question by text or voice. AI helps you understand each other across languages." },
      { property: "og:title", content: "Ask Noor — Roots & Routes" },
      { property: "og:description", content: "Talk with a coffee farmer across languages. Noor answers, AI translates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Chat,
});

function HearTranslation({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [audio, setAudio] = useState<string | null>(null);
  if (audio) return <AudioPlayer src={audio} label="Hear the translation" />;
  return (
    <button
      type="button"
      disabled={state === "loading"}
      onClick={async () => {
        setState("loading");
        const r = await speakTranslation({ data: { text } }).catch(() => null);
        if (r?.ok) {
          setAudio(r.audio);
          new Audio(r.audio).play().catch(() => {});
        } else setState("error");
      }}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
    >
      {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
      {state === "error" ? "Read-aloud unavailable" : "Hear the translation"}
    </button>
  );
}

function Chat() {
  const messages = useStore((s) => s.messages);
  const lang = useStore((s) => s.visitorLanguage);
  const NOOR_LANGUAGE = useStore((s) => s.noorLanguage);
  const on = useOnline();
  const [text, setText] = useState("");
  const [more, setMore] = useState(false);
  const hasNoorReply = messages.some((m) => m.from === "noor" && m.status === "delivered");
  const lastVisitor = [...messages].reverse().find((m) => m.from === "visitor");
  const visible = messages.filter((m) => m.from === "visitor" || m.status === "delivered");

  return (
    <Shell title="Ask Noor" back="/">
      <div className="space-y-4 px-4 py-5">
        <div className="flex items-center gap-3 rounded-2xl bg-muted p-3 text-sm">
          <img src={noor} alt="Noor" width={816} height={816} className="h-12 w-12 rounded-full object-cover" />
          <p><b>Noor answers you herself.</b> AI only helps you understand each other.</p>
        </div>

        <label className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3 text-sm font-semibold">
          Your language
          <select value={lang} onChange={(e) => setVisitorLanguage(e.target.value)} className="h-11 rounded-xl border bg-background px-3 text-base">
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary px-2 py-1 text-primary-foreground">You · {lang}</span>
          <ArrowDown className="h-3 w-3 -rotate-90" /> <span>AI translates</span> <ArrowDown className="h-3 w-3 -rotate-90" />
          <span className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground">Noor · {NOOR_LANGUAGE}</span>
        </div>

        <p className="text-center text-sm">⏱️ Noor usually replies {REPLY_TIME}.</p>
        {!on && (
          <p role="status" className="rounded-2xl border-2 border-warning bg-card p-3 text-sm font-semibold">
            You're offline. Your message is saved on this phone and will be sent when you're back online.
          </p>
        )}
        {(visible.length === 0 || more) && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Suggested questions</p>
            {SUGGESTED.map((s) => (
              <button key={s.q} onClick={() => { sendVisitorMessage({ text: s.q }); setMore(false); }} className="block w-full rounded-2xl border bg-card p-4 text-left text-base">
                "{s.q}"
              </button>
            ))}
          </div>
        )}

        {visible.map((m) =>
          m.from === "visitor" ? (
            <div key={m.id} className="ml-10 space-y-1">
              <p className="text-right text-xs font-semibold text-muted-foreground">Your message</p>
              <div className="rounded-2xl rounded-br-sm bg-primary p-3 text-primary-foreground">
                {m.audio ? <AudioPlayer src={m.audio} label="Your voice message" /> : m.text}
                {m.audio && m.transcript && <p className="mt-2 text-sm italic opacity-90">"{m.transcript}"</p>}
              </div>
              {(m.status === "translating" || m.status === "transcribing" || m.status === "processing") && (
                <p className="flex items-center justify-end gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Translating for Noor…</p>
              )}
              {m.translated && <p className="rounded-xl bg-card p-2 text-xs text-muted-foreground"><b>Translated for Noor</b> · AI · {NOOR_LANGUAGE}: {m.translated}</p>}
              <div className="flex items-center justify-end gap-3">
                {m.error && <span className="text-xs text-destructive">{m.error}</span>}
                {m.status === "error" && <button onClick={() => retryMessage(m.id)} className="text-xs font-semibold text-primary">Retry</button>}
                <MsgBadge status={m.status} />
              </div>
              {m.id === lastVisitor?.id && m.status === "delivered" && !hasNoorReply && (
                <p className="text-right text-xs font-semibold">Sent → Waiting for Noor · We'll show her reply here when she answers.</p>
              )}
            </div>
          ) : (
            <div key={m.id} className="mr-6 space-y-3 rounded-2xl rounded-bl-sm border bg-card p-4">
              <div className="flex items-center gap-2">
                <img src={noor} alt="" width={816} height={816} className="h-7 w-7 rounded-full object-cover" />
                <p className="text-sm font-semibold">Noor</p>
                {m.demo && <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">Demo reply</span>}
              </div>
              {m.audio && <AudioPlayer src={m.audio} label="Hear Noor's response" />}
              {(m.text || m.transcript) && <p className="text-sm italic text-muted-foreground">{NOOR_LANGUAGE}: "{m.text ?? m.transcript}"</p>}
              {m.translated && (
                <>
                  <p className="text-base">{m.translated}</p>
                  <HearTranslation text={m.translated} />
                  <p className="text-xs text-muted-foreground"><b>Translated back for you</b> · Translated by AI into {lang}{m.audio ? " · the voice above is Noor's own" : ""}</p>
                </>
              )}
            </div>
          ),
        )}

        {visible.length > 0 && !more && (
          <button onClick={() => setMore(true)} className="w-full rounded-full border bg-card py-3 font-semibold">Ask another question</button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-16 mx-auto max-w-md border-t bg-background p-3">
        {!text && <Recorder big label="Tap to speak" onDone={(audio) => sendVisitorMessage({ audio })} />}
        <form
          className="mt-2 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            sendVisitorMessage({ text: text.trim() });
            setText("");
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="…or type to Noor"
            className="h-12 min-w-0 flex-1 rounded-full border bg-card px-4 outline-none focus:ring-2 focus:ring-ring"
          />
          {text && (
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Send">
              <Send className="h-5 w-5" />
            </button>
          )}
        </form>
      </div>
      <div className="h-56" aria-hidden="true" />
    </Shell>
  );
}
