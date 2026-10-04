import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/rooted";
import { addDemoFeedback, prepareDigest, sendNoorText, setDraft, setSmsSettings, useStore } from "@/lib/store";
import { SMS_LABEL, SYNC_LABEL, smsLink, type SmsFrequency } from "@/lib/feedback-sync";

export const Route = createFileRoute("/noor/sms")({
  head: () => ({ meta: [{ title: "Roots & Routes — Text messages for Noor" }] }),
  component: SmsPage,
});

const FREQ: { id: SmsFrequency; label: string }[] = [
  { id: "immediate", label: "Right away" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
];

function SmsPage() {
  const s = useStore((x) => x);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = s.feedback.filter((f) => f.sync && f.sync !== "synced");
  return (
    <Shell title="Text messages" back="/noor">
      <div className="space-y-5 px-5 py-6">
        <p className="text-sm text-muted-foreground">
          The app writes a short text in {s.noorLanguage} from visitor feedback. You send it from this phone's messages app — no extra cost. We can't see if it arrived.
        </p>

        <section className="space-y-3 rounded-3xl border bg-card p-5">
          <label className="block text-sm font-semibold">Noor's phone number
            <input type="tel" inputMode="tel" value={s.noorPhone} onChange={(e) => setSmsSettings({ noorPhone: e.target.value })} placeholder="+255 …" className="mt-1 h-12 w-full rounded-xl border bg-background px-3 text-base" />
          </label>
          <p className="text-xs text-muted-foreground">Saved only on this phone.</p>
          <p className="text-sm font-semibold">How often to prepare a text</p>
          <div className="grid grid-cols-3 gap-2">
            {FREQ.map((f) => (
              <button key={f.id} onClick={() => setSmsSettings({ smsFrequency: f.id })} className={`min-h-12 rounded-full border font-semibold ${s.smsFrequency === f.id ? "bg-primary text-primary-foreground" : "bg-background"}`}>{f.label}</button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={s.smsSimulated} onChange={(e) => setSmsSettings({ smsSimulated: e.target.checked })} className="h-5 w-5" />
            Demo mode — simulated SMS (nothing is sent)
          </label>
        </section>

        {pending.length > 0 && (
          <p role="status" className="rounded-2xl bg-muted p-3 text-sm">
            {pending.length} feedback waiting · {[...new Set(pending.map((f) => SYNC_LABEL[f.sync!]))].join(", ")}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button disabled={busy} onClick={async () => { setBusy(true); await prepareDigest(true); setBusy(false); }} className="min-h-14 rounded-full bg-primary font-semibold text-primary-foreground disabled:opacity-50">
            {busy ? "Writing…" : "✍️ Write text now"}
          </button>
          <button onClick={() => addDemoFeedback()} className="min-h-14 rounded-full border bg-card font-semibold">+ Sample feedback (demo)</button>
        </div>

        {s.smsDrafts.length === 0 && <p className="py-6 text-center text-muted-foreground">No texts yet</p>}
        {s.smsDrafts.map((d) => (
          <article key={d.id} className="space-y-3 rounded-3xl border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-muted px-2 py-1">{SMS_LABEL[d.status]}</span>
              {d.simulated && <span className="rounded-full bg-accent px-2 py-1 text-accent-foreground">Simulated SMS</span>}
              <span className="text-muted-foreground">{new Date(d.at).toLocaleString()} · {d.count} visitors</span>
            </div>
            {d.needsReview && <p className="text-sm font-semibold">⚠️ Translation may not be exact — please check before sending.</p>}
            <p className="rounded-2xl bg-muted p-4 text-lg">{d.text}</p>
            <details className="text-sm">
              <summary className="cursor-pointer font-semibold">See in English</summary>
              <p className="mt-2 font-semibold">What visitors said</p>
              <ul className="list-disc pl-5">{d.findings.map((x) => <li key={x}>{x}</li>)}</ul>
              <p className="mt-2 font-semibold">AI suggestions (not visitor words)</p>
              <ul className="list-disc pl-5">{d.suggestions.map((x) => <li key={x}>{x}</li>)}</ul>
            </details>
            {d.simulated ? (
              <button onClick={() => setDraft(d.id, { status: "sent" })} className="w-full rounded-full border py-4 text-lg font-semibold">✓ Mark as sent (simulated)</button>
            ) : s.noorPhone ? (
              <>
                <a href={smsLink(s.noorPhone, d.text)} onClick={() => setDraft(d.id, { status: "opened" })} className="block w-full rounded-full bg-primary py-4 text-center text-lg font-semibold text-primary-foreground">✉️ Send by SMS</a>
                {d.status === "opened" && <button onClick={() => setDraft(d.id, { status: "sent" })} className="w-full rounded-full border py-3 font-semibold">✓ I sent it</button>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Add Noor's phone number above to send.</p>
            )}
          </article>
        ))}

        <section className="space-y-3 rounded-3xl border bg-card p-5">
          <p className="font-semibold">Add Noor's SMS reply</p>
          <p className="text-xs text-muted-foreground">Did Noor text back from her phone? Paste it here in {s.noorLanguage}. It will be translated for the visitor, and her words are kept.</p>
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} className="w-full rounded-2xl border bg-background p-3" />
          <button disabled={!reply.trim()} onClick={() => { sendNoorText(reply.trim()); setReply(""); }} className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground disabled:opacity-40">Add reply</button>
        </section>
      </div>
    </Shell>
  );
}
