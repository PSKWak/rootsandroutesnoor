import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, CheckCheck, Clock, AlertCircle, Mic, Square, Play, Pause, Home, MessageCircle, CalendarDays, Star, Sprout, Loader2, Languages, RotateCcw, Lightbulb } from "lucide-react";
import type { BookingStatus, MsgStatus } from "@/lib/store";

export function Shell({ children, title, back }: { children: ReactNode; title?: string; back?: string }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-24">
      {title && (
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/90 px-5 py-4 backdrop-blur">
          {back && (
            <Link to={back} className="-ml-2 rounded-full px-2 py-1 text-lg text-muted-foreground" aria-label="Back">
              ←
            </Link>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
          <OnlineDot />
        </header>
      )}
      {children}
      <VisitorNav />
    </div>
  );
}

function OnlineDot() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const u = () => setOn(navigator.onLine);
    u();
    window.addEventListener("online", u);
    window.addEventListener("offline", u);
    return () => {
      window.removeEventListener("online", u);
      window.removeEventListener("offline", u);
    };
  }, []);
  return (
    <span className={`ml-auto flex items-center gap-1.5 text-xs ${on ? "text-success" : "text-warning"}`}>
      <span className={`h-2 w-2 rounded-full ${on ? "bg-success" : "bg-warning"}`} />
      {on ? "Online" : "Offline — messages queued"}
    </span>
  );
}

function VisitorNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const noor = path.startsWith("/noor");
  const items = noor
    ? ([
        { to: "/noor", icon: Home, label: "Overview" },
        { to: "/noor/insights", icon: Lightbulb, label: "Insights" },
        { to: "/noor/inbox", icon: MessageCircle, label: "Messages" },
        { to: "/noor/bookings", icon: CalendarDays, label: "Experiences" },
      ] as const)
    : ([
        { to: "/", icon: Home, label: "Home" },
        { to: "/experience", icon: Sprout, label: "Experience" },
        { to: "/chat", icon: MessageCircle, label: "Ask Noor" },
        { to: "/feedback", icon: Star, label: "Feedback" },
      ] as const);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md justify-around border-t bg-card/95 py-2 backdrop-blur">
      {items.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" || to === "/noor" }}
          className="flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-xs text-muted-foreground"
          activeProps={{ className: "text-primary font-semibold" }}
        >
          <Icon className="h-6 w-6" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

const MSG: Record<MsgStatus, { label: string; icon: typeof Check; cls: string }> = {
  processing: { label: "Processing…", icon: Loader2, cls: "text-muted-foreground" },
  transcribing: { label: "Transcribing…", icon: Loader2, cls: "text-muted-foreground" },
  translating: { label: "Translating…", icon: Languages, cls: "text-muted-foreground" },
  error: { label: "Error", icon: AlertCircle, cls: "text-destructive" },
  sent: { label: "Sent", icon: Check, cls: "text-muted-foreground" },
  delivered: { label: "Delivered", icon: CheckCheck, cls: "text-success" },
  waiting: { label: "Waiting for connection", icon: Clock, cls: "text-warning" },
  review: { label: "Needs review", icon: AlertCircle, cls: "text-primary" },
};
export function MsgBadge({ status }: { status: MsgStatus }) {
  const { label, icon: Icon, cls } = MSG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${cls}`}>
      <Icon className={`h-3.5 w-3.5 ${status === "processing" || status === "transcribing" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

const BOOK: Record<BookingStatus, { label: string; cls: string }> = {
  requested: { label: "Requested", cls: "bg-muted text-muted-foreground" },
  awaiting: { label: "Awaiting Noor", cls: "bg-accent text-accent-foreground" },
  confirmed: { label: "Confirmed", cls: "bg-success text-primary-foreground" },
  declined: { label: "Declined", cls: "bg-destructive text-destructive-foreground" },
  alternative: { label: "Alternative time suggested", cls: "bg-secondary text-secondary-foreground" },
};
export function BookingBadge({ status }: { status: BookingStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BOOK[status].cls}`}>{BOOK[status].label}</span>;
}

export function AudioPlayer({ src, label = "Voice message", onPlay, big }: { src: string; label?: string; onPlay?: () => void; big?: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        const a = ref.current!;
        if (playing) a.pause();
        else {
          void a.play();
          onPlay?.();
        }
      }}
      className={`flex items-center gap-3 rounded-full bg-secondary text-secondary-foreground ${big ? "w-full px-6 py-5 text-lg" : "px-4 py-2 text-sm"}`}
    >
      {playing ? <Pause className={big ? "h-7 w-7" : "h-4 w-4"} /> : <Play className={big ? "h-7 w-7" : "h-4 w-4"} />}
      <span className="font-semibold">{label}</span>
      <audio ref={ref} src={src} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    </button>
  );
}

export function Recorder({ onDone, big, label = "Record" }: { onDone: (dataUrl: string) => void; big?: boolean; label?: string }) {
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [secs, setSecs] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!rec) return;
    const t = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [rec]);
  const start = async () => {
    setErr(null);
    setSecs(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const fr = new FileReader();
        fr.onload = () => setPreview(fr.result as string);
        fr.readAsDataURL(new Blob(chunks, { type: r.mimeType }));
      };
      r.start();
      setRec(r);
    } catch {
      setErr("Microphone not available. Please allow microphone access.");
    }
  };
  const stop = () => {
    rec?.stop();
    setRec(null);
  };
  const time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const btn = big ? "flex-1 py-5 text-lg" : "px-4 py-2 text-sm";

  if (preview)
    return (
      <div className={`flex w-full items-center gap-2 ${big ? "flex-col" : ""}`}>
        <AudioPlayer src={preview} label={`Play · ${time}`} big={!!big} />
        <div className="flex w-full gap-2">
          <button type="button" onClick={() => { setPreview(null); void start(); }} className={`flex items-center justify-center gap-2 rounded-full border bg-card font-semibold ${btn}`}>
            <RotateCcw className="h-5 w-5" /> Re-record
          </button>
          <button type="button" onClick={() => { onDone(preview); setPreview(null); }} className={`flex items-center justify-center gap-2 rounded-full bg-success font-semibold text-primary-foreground ${btn}`}>
            <Check className="h-5 w-5" /> Send
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={rec ? stop : start}
        className={`flex items-center justify-center gap-3 rounded-full font-semibold shadow-warm transition ${
          rec ? "animate-pulse bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
        } ${big ? "w-full py-6 text-xl" : "h-12 min-w-12 px-3"}`}
        aria-label={rec ? "Stop recording" : "Record voice"}
      >
        {rec ? <Square className={big ? "h-7 w-7" : "h-5 w-5"} /> : <Mic className={big ? "h-8 w-8" : "h-5 w-5"} />}
        {rec ? <span>{big ? `Listening… ${time}` : time}</span> : big && label}
      </button>
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

/**
 * Lightweight scroll reveal: fades and rises its children once they enter the
 * viewport. Transform/opacity only, and the animation is switched off entirely
 * for visitors who prefer reduced motion (handled in styles.css).
 */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} ${shown ? "animate-rise-in" : "opacity-0"}`} style={shown ? { animationDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
