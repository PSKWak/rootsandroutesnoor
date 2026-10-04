import { useSyncExternalStore } from "react";

export type MsgStatus = "processing" | "transcribing" | "translating" | "sent" | "delivered" | "waiting" | "review" | "error";
export type Message = {
  id: string;
  from: "visitor" | "noor";
  text?: string | undefined;
  translated?: string | undefined;
  audio?: string | undefined;
  status: MsgStatus;
  at: number;
  heardByNoor?: boolean | undefined;
  transcript?: string | undefined;
  error?: string | undefined;
  demo?: boolean | undefined;
};
export type BookingStatus = "requested" | "awaiting" | "confirmed" | "declined" | "alternative";
export type Booking = {
  id: string;
  experienceId: string;
  date: string;
  guests: number;
  time?: string | undefined;
  name?: string | undefined;
  contact?: string | undefined;
  message?: string | undefined;
  status: BookingStatus;
  altDate?: string | undefined;
  at: number;
};
export type Feedback = {
  id: string;
  rating: number;
  text?: string | undefined;
  audio?: string | undefined;
  tags: string[];
  photo?: string | undefined;
  at: number;
};
export type Sms = { id: string; text: string; at: number };

export type State = {
  messages: Message[];
  bookings: Booking[];
  feedback: Feedback[];
  sms: Sms[];
  visitorLanguage: string;
  pickups: PickupRequest[];
  /** Noor's choice for each suggested action, keyed by the action text. */
  insightActions: Record<string, ActionChoice>;
  noorLanguage: string;
  capacity: Capacity;
  hostUnlocked: boolean;
};
/** Noor's own availability rules. Editable by Noor; bookings outside them are flagged, never auto-handled. */
export type Capacity = { times: string[]; maxGuests: Record<string, number>; unavailable: string[]; availableDays: number[] };
export type ActionChoice = "trying" | "done" | "later";
export function setInsightAction(action: string, choice: ActionChoice | null) {
  set((s) => {
    const next = { ...(s.insightActions ?? {}) };
    if (choice) next[action] = choice;
    else delete next[action];
    return { ...s, insightActions: next };
  });
}

/** A request only. Never auto-confirmed — Noor arranges transport herself. */
export type PickupRequest = {
  id: string;
  name: string;
  date: string;
  guests: number;
  location: string;
  time: string;
  notes: string;
  at: number;
};

/** Prices are SAMPLE values until Noor sets her own. */
export const PRICES_ARE_SAMPLE = true;
export const EXPERIENCES = [
  { id: "walk", title: "Morning farm walk", duration: "2 hours", priceUsd: 18, price: "$18 per person", desc: "Walk the terraces with Noor and pick ripe cherries by hand." },
  { id: "process", title: "Bean to cup", duration: "Half day", priceUsd: 35, price: "$35 per person", desc: "Pulp, wash, dry and roast coffee — then brew it together over fire." },
  { id: "lunch", title: "Harvest lunch with family", duration: "3 hours", priceUsd: 25, price: "$25 per person", desc: "Share a home-cooked highland meal and stories at Noor's table." },
];

export const FEEDBACK_TAGS = ["Coffee", "Farming", "Meeting Noor", "Local culture", "Community", "Farm walk"];

const day = 86400000;
const seed = (): State => ({
  messages: [],
  bookings: [],
  sms: [],
  pickups: [],
  insightActions: {},
  noorLanguage: "Swahili",
  capacity: { times: ["08:00", "10:00", "14:00"], maxGuests: { walk: 8, process: 6, lunch: 10 }, unavailable: [], availableDays: [1, 2, 3, 4, 5, 6] },
  hostUnlocked: false,
  visitorLanguage: "English",
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

/** Languages Noor can choose for herself. Only languages the translation service supports. */
export const NOOR_LANGUAGES = ["Swahili", "English", "Amharic", "French", "Arabic", "Spanish"];
/** @deprecated use state.noorLanguage */
export const NOOR_LANGUAGE = "Swahili";
export function setNoorLanguage(l: string) {
  set((s) => ({ ...s, noorLanguage: l }));
}
/** Demo PIN for the host area — NOT real security. Replace with real sign-in before launch. */
export const DEMO_HOST_PIN = "1234";
export function unlockHost(pin: string) {
  if (pin !== DEMO_HOST_PIN) return false;
  set((s) => ({ ...s, hostUnlocked: true }));
  return true;
}
export function lockHost() {
  set((s) => ({ ...s, hostUnlocked: false }));
}
export function setCapacity(c: Capacity) {
  set((s) => ({ ...s, capacity: c }));
}
/** Noor typically replies within this window. Configurable. */
export const REPLY_TIME = "within 1 day";
export const LANGUAGES = ["English", "Spanish", "French", "German", "Japanese", "Mandarin Chinese", "Arabic"];
export function setVisitorLanguage(l: string) {
  set((s) => ({ ...s, visitorLanguage: l }));
}

/** Suggested questions with demo replies written as Noor's sample answers (clearly labelled demo in the UI). */
export const SUGGESTED = [
  { q: "Why is coffee important to your family?", a: "Kahawa ni maisha yetu. Bibi yangu alipanda miti ya kwanza, na sasa mimi na binti yangu tunaitunza." },
  { q: "What makes this coffee different?", a: "Tunachuma kila tunda kwa mkono linapoiva, na tunakausha juani polepole." },
  { q: "What is your favorite part of the harvest?", a: "Asubuhi na ukungu, tunapochuma pamoja na kuimba. Ni wakati wa familia." },
  { q: "Can I help roast the coffee?", a: "Ndiyo! Tunakaanga kwenye sufuria ya udongo juu ya moto. Utaona na kunusa kila hatua." },
];

function smsToNoor(text: string) {
  set((s) => ({ ...s, sms: [{ id: uid(), text, at: Date.now() }, ...s.sms] }));
}

function patch(id: string, p: Partial<Message>) {
  set((s) => ({ ...s, messages: s.messages.map((m) => (m.id === id ? { ...m, ...p } : m)) }));
}

const inFlight = new Set<string>();

/** Transcribe (if voice) + translate on the server, then deliver. Recording is kept locally throughout. */
async function processMessage(id: string) {
  const m = state.messages.find((x) => x.id === id);
  if (!m || inFlight.has(id)) return;
  if (!online()) return patch(id, { status: "waiting" });
  inFlight.add(id);
  try {
    patch(id, { status: m.audio ? "transcribing" : "translating", error: undefined });
    const { processVoice } = await import("./voice.functions");
    if (m.audio) setTimeout(() => state.messages.find((x) => x.id === id)?.status === "transcribing" && patch(id, { status: "translating" }), 2500);
    const r = await processVoice({
      data: {
        ...(m.audio ? { audio: m.audio } : { text: m.text ?? "" }),
        from: m.from,
        targetLanguage: m.from === "visitor" ? state.noorLanguage : state.visitorLanguage,
      },
    });
    if (!r.ok) return patch(id, { status: "error", error: r.error });
    patch(id, {
      transcript: r.transcript || undefined,
      translated: r.translated || undefined,
      // Noor's translated reply always waits for her family's review before the visitor sees it
      status: m.from === "noor" ? (m.demo ? "delivered" : "review") : "sent",
      error: "error" in r ? r.error : undefined,
    });
    if (m.from === "visitor") {
      deliver(id);
      const demo = SUGGESTED.find((x) => x.q === m.text);
      if (demo)
        setTimeout(() => {
          const reply: Message = { id: uid(), from: "noor", text: demo.a, demo: true, status: "translating", at: Date.now() };
          set((s) => ({ ...s, messages: [...s.messages, reply] }));
          void processMessage(reply.id);
        }, 2500);
    }
  } catch (e) {
    patch(id, { status: online() ? "error" : "waiting", error: online() ? "Could not process. Tap retry." : undefined });
    console.error(e);
  } finally {
    inFlight.delete(id);
  }
}

export function retryMessage(id: string) {
  void processMessage(id);
}

export function sendVisitorMessage(input: { text?: string; audio?: string }) {
  const m: Message = {
    id: uid(),
    from: "visitor",
    text: input.text,
    audio: input.audio,
    status: online() ? "processing" : "waiting",
    at: Date.now(),
  };
  set((s) => ({ ...s, messages: [...s.messages, m] }));
  void processMessage(m.id);
}

function deliver(id: string) {
  setTimeout(() => {
    patch(id, { status: "delivered" });
    const m = state.messages.find((x) => x.id === id);
    if (m?.from === "visitor")
      smsToNoor(`Roots & Routes: New ${m.audio ? "voice " : ""}message from a visitor. Open the app on the shared phone to listen.`);
  }, 1200);
}

export function flushQueue() {
  if (!online()) return;
  state.messages
    .filter((m) => m.status === "waiting" || m.status === "processing" || m.status === "transcribing" || m.status === "translating")
    .forEach((m) => void processMessage(m.id));
}

export function markHeard(id: string) {
  patch(id, { heardByNoor: true });
}

/** Noor rejects a translation that isn't what she meant; she then records or types again. */
export function discardReply(id: string) {
  set((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== id) }));
}
export function sendNoorText(text: string) {
  const m: Message = { id: uid(), from: "noor", text, status: online() ? "processing" : "waiting", at: Date.now() };
  set((s) => ({ ...s, messages: [...s.messages, m] }));
  void processMessage(m.id);
}
export function sendNoorReply(audio: string) {
  const m: Message = { id: uid(), from: "noor", audio, status: online() ? "processing" : "waiting", at: Date.now() };
  set((s) => ({ ...s, messages: [...s.messages, m] }));
  void processMessage(m.id);
}

export function approveTranslation(id: string) {
  set((s) => ({ ...s, messages: s.messages.map((m) => (m.id === id ? { ...m, status: "delivered" } : m)) }));
}

export function requestPickup(p: Omit<PickupRequest, "id" | "at">) {
  const req: PickupRequest = { ...p, id: uid(), at: Date.now() };
  set((s) => ({ ...s, pickups: [req, ...(s.pickups ?? [])] }));
  smsToNoor(`Roots & Routes: Pickup request for ${p.date} ${p.time}, ${p.guests} visitor(s) from ${p.location}.`);
}

export function estimateTotal(experienceId: string, guests: number) {
  const e = EXPERIENCES.find((x) => x.id === experienceId);
  return e ? e.priceUsd * guests : 0;
}
/** Warnings against Noor's capacity rules. Shown to Noor; never auto-declines. */
export function capacityIssues(b: Pick<Booking, "experienceId" | "date" | "guests">, c: Capacity) {
  const out: string[] = [];
  if (c.unavailable.includes(b.date)) out.push("You marked this day as unavailable");
  const d = new Date(b.date);
  if (!Number.isNaN(d.getTime()) && !c.availableDays.includes(d.getUTCDay())) out.push("Not one of your open days");
  const max = c.maxGuests[b.experienceId];
  if (max && b.guests > max) out.push(`More than your limit of ${max} guests`);
  return out;
}
export function requestBooking(b: { experienceId: string; date: string; guests: number; time?: string; name?: string; contact?: string; message?: string }) {
  const booking: Booking = { ...b, id: uid(), status: "requested", at: Date.now() };
  set((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
  setTimeout(() => {
    set((s) => ({
      ...s,
      bookings: s.bookings.map((x) => (x.id === booking.id && x.status === "requested" ? { ...x, status: "awaiting" } : x)),
    }));
    smsToNoor(`Roots & Routes: Booking request from ${b.name ?? "a visitor"} for ${b.date}${b.time ? " " + b.time : ""}, ${b.guests} guest(s). Reply on the shared phone: accept, decline or new time.`);
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
  { label: "mentioned meeting Noor", action: "Keep sharing your family story with guests", match: (f: Feedback) => f.tags.includes("Meeting Noor") || /noor/i.test(f.text ?? "") },
  { label: "mentioned coffee processing", action: "Let guests try washing and drying beans", match: (f: Feedback) => /process|washing|drying/i.test(f.text ?? "") },
  { label: "asked about roasting", action: "Show guests how you roast coffee", match: (f: Feedback) => /roast/i.test(f.text ?? "") },
  { label: "enjoyed the farm walk", action: "Offer the walk early in the morning", match: (f: Feedback) => f.tags.includes("Farm walk") || /walk/i.test(f.text ?? "") },
  { label: "mentioned community or family", action: "Invite family to join the visit", match: (f: Feedback) => f.tags.includes("Community") || /family|community/i.test(f.text ?? "") },
];

export function feedbackThemes(list: Feedback[]) {
  return THEMES.map((t) => ({ label: t.label, action: t.action, count: list.filter(t.match).length }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);
}

export const SMALL_SAMPLE = 10;
export { day };
