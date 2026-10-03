import { useSyncExternalStore } from "react";

export type MsgStatus = "sent" | "delivered" | "waiting" | "review";
export type Message = {
  id: string;
  from: "visitor" | "noor";
  text?: string;
  translated?: string;
  audio?: string;
  status: MsgStatus;
  at: number;
  heardByNoor?: boolean;
};
export type BookingStatus = "requested" | "awaiting" | "confirmed" | "declined" | "alternative";
export type Booking = {
  id: string;
  experienceId: string;
  date: string;
  guests: number;
  status: BookingStatus;
  altDate?: string;
  at: number;
};
export type Feedback = {
  id: string;
  rating: number;
  text?: string;
  audio?: string;
  tags: string[];
  at: number;
};
export type Sms = { id: string; text: string; at: number };

export type State = {
  messages: Message[];
  bookings: Booking[];
  feedback: Feedback[];
  sms: Sms[];
};

export const EXPERIENCES = [
  { id: "walk", title: "Morning farm walk", duration: "2 hours", price: "$18 per person", desc: "Walk the terraces with Noor and pick ripe cherries by hand." },
  { id: "process", title: "Bean to cup", duration: "Half day", price: "$35 per person", desc: "Pulp, wash, dry and roast coffee — then brew it together over fire." },
  { id: "lunch", title: "Harvest lunch with family", duration: "3 hours", price: "$25 per person", desc: "Share a home-cooked highland meal and stories at Noor's table." },
];

export const FEEDBACK_TAGS = ["Coffee", "Farming", "Meeting Noor", "Local culture", "Community", "Farm walk"];

const day = 86400000;
const seed = (): State => ({
  messages: [],
  bookings: [],
  sms: [],
  feedback: [
    { id: "f1", rating: 5, text: "Meeting Noor was the highlight. She explained coffee processing so patiently.", tags: ["Meeting Noor", "Coffee"], at: Date.UTC(2026, 8, 2) },
    { id: "f2", rating: 5, text: "Loved the farm walk at sunrise. I wish we could learn roasting too.", tags: ["Farm walk", "Meeting Noor"], at: Date.UTC(2026, 8, 9) },
    { id: "f3", rating: 4, text: "Great to see coffee processing up close. Is there a roasting session?", tags: ["Coffee", "Farming"], at: Date.UTC(2026, 8, 15) },
    { id: "f4", rating: 5, text: "Noor and her daughter made us feel like family.", tags: ["Meeting Noor", "Community"], at: Date.UTC(2026, 8, 21) },
    { id: "f5", rating: 4, text: "The washing and drying of coffee processing was fascinating.", tags: ["Meeting Noor", "Local culture"], at: Date.UTC(2026, 8, 27) },
  ],
});

const KEY = "rooted-state-v1";
let state: State = seed();
const listeners = new Set<() => void>();

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full — keep in memory */
  }
  listeners.forEach((l) => l());
}

export function hydrateStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...seed(), ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
  window.addEventListener("online", flushQueue);
  flushQueue();
}

export function resetDemo() {
  state = seed();
  emit();
}

const serverSnap = seed();
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => sel(state),
    () => sel(serverSnap),
  );
}

function set(fn: (s: State) => State) {
  state = fn(state);
  emit();
}

const uid = () => Math.random().toString(36).slice(2, 10);
const online = () => typeof navigator === "undefined" || navigator.onLine;

/** Simulated translation for the demo (English → Noor's language, Ondera). */
export function translateForNoor(text: string) {
  return `[Ondera] ${text}`;
}

const NOOR_REPLIES = [
  "Welcome! Yes, you can visit. Mornings are best, the mist is beautiful. Bring good shoes.",
  "Thank you for your message. The cherries are ripe now. I will show you everything.",
  "Yes, children are welcome. My daughter will help translate when you arrive.",
];

function smsToNoor(text: string) {
  set((s) => ({ ...s, sms: [{ id: uid(), text, at: Date.now() }, ...s.sms] }));
}

export function sendVisitorMessage(input: { text?: string; audio?: string }) {
  const m: Message = {
    id: uid(),
    from: "visitor",
    text: input.text,
    translated: input.text ? translateForNoor(input.text) : undefined,
    audio: input.audio,
    status: online() ? "sent" : "waiting",
    at: Date.now(),
  };
  set((s) => ({ ...s, messages: [...s.messages, m] }));
  if (m.status === "sent") deliver(m.id);
}

function deliver(id: string) {
  setTimeout(() => {
    set((s) => ({
      ...s,
      messages: s.messages.map((m) => (m.id === id ? { ...m, status: "delivered" } : m)),
    }));
    const m = state.messages.find((x) => x.id === id);
    if (m?.from === "visitor")
      smsToNoor(`Rooted: New ${m.audio ? "voice " : ""}message from a visitor. Open Rooted on the shared phone to listen.`);
  }, 1200);
}

export function flushQueue() {
  if (!online()) return;
  const waiting = state.messages.filter((m) => m.status === "waiting");
  if (!waiting.length) return;
  set((s) => ({
    ...s,
    messages: s.messages.map((m) => (m.status === "waiting" ? { ...m, status: "sent" } : m)),
  }));
  waiting.forEach((m) => deliver(m.id));
}

export function markHeard(id: string) {
  set((s) => ({ ...s, messages: s.messages.map((m) => (m.id === id ? { ...m, heardByNoor: true } : m)) }));
}

export function sendNoorReply(audio: string) {
  const n = state.messages.filter((m) => m.from === "noor").length;
  const m: Message = {
    id: uid(),
    from: "noor",
    audio,
    translated: NOOR_REPLIES[n % NOOR_REPLIES.length],
    // auto-translations of Noor's voice are flagged until she/her daughter confirms
    status: online() ? "review" : "waiting",
    at: Date.now(),
  };
  set((s) => ({ ...s, messages: [...s.messages, m] }));
}

export function approveTranslation(id: string) {
  set((s) => ({ ...s, messages: s.messages.map((m) => (m.id === id ? { ...m, status: "delivered" } : m)) }));
}

export function requestBooking(b: { experienceId: string; date: string; guests: number }) {
  const booking: Booking = { ...b, id: uid(), status: "requested", at: Date.now() };
  set((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
  setTimeout(() => {
    set((s) => ({
      ...s,
      bookings: s.bookings.map((x) => (x.id === booking.id && x.status === "requested" ? { ...x, status: "awaiting" } : x)),
    }));
    smsToNoor(`Rooted: Booking request for ${b.date}, ${b.guests} guest(s). Reply on the shared phone: accept, decline or new time.`);
  }, 1000);
}

/** Only Noor can call this. There is no automatic confirmation anywhere. */
export function noorDecide(id: string, decision: "confirmed" | "declined" | "alternative", altDate?: string) {
  set((s) => ({
    ...s,
    bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: decision, altDate } : b)),
  }));
}

export function acceptAlternative(id: string) {
  // Visitor accepting Noor's suggested time. Noor proposed it, so it is her decision.
  set((s) => ({
    ...s,
    bookings: s.bookings.map((b) => (b.id === id && b.altDate ? { ...b, date: b.altDate, altDate: undefined, status: "confirmed" } : b)),
  }));
}

export function submitFeedback(f: Omit<Feedback, "id" | "at">) {
  set((s) => ({ ...s, feedback: [{ ...f, id: uid(), at: Date.now() }, ...s.feedback] }));
}

const THEMES = [
  { label: "mentioned meeting Noor", match: (f: Feedback) => f.tags.includes("Meeting Noor") || /noor/i.test(f.text ?? "") },
  { label: "mentioned coffee processing", match: (f: Feedback) => /process|washing|drying/i.test(f.text ?? "") },
  { label: "asked about roasting", match: (f: Feedback) => /roast/i.test(f.text ?? "") },
  { label: "enjoyed the farm walk", match: (f: Feedback) => f.tags.includes("Farm walk") || /walk/i.test(f.text ?? "") },
  { label: "mentioned community or family", match: (f: Feedback) => f.tags.includes("Community") || /family|community/i.test(f.text ?? "") },
];

export function feedbackThemes(list: Feedback[]) {
  return THEMES.map((t) => ({ label: t.label, count: list.filter(t.match).length }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);
}

export const SMALL_SAMPLE = 10;
export { day };
