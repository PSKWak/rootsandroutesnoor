/**
 * Local hosts. Roots & Routes is built so more hosts can be added later;
 * for the MVP Noor is the only active host. Never add made-up hosts here.
 */
import { EXPERIENCES } from "./store";
import { LOCATION } from "./farm-info";

export type Host = {
  id: string;
  name: string;
  farmName: string;
  story: string;
  location: string;
  languages: string[];
  experienceIds: string[];
  contact: "in-app";
  products: { id: string; name: string; note: string }[];
  active: boolean;
};

export const HOSTS: Host[] = [
  {
    id: "noor",
    name: "Noor",
    farmName: "Noor's family coffee farm",
    story:
      "My grandmother planted the first coffee trees on this hill. Today I care for them with my daughter. Guests come to walk the terraces, help with the harvest, and drink coffee we roast ourselves.",
    location: `Ondera Highlands · ${LOCATION.nearestTown}`,
    languages: ["Swahili (sample)", "Visitors: any language via AI translation"],
    experienceIds: EXPERIENCES.map((e) => e.id),
    contact: "in-app",
    products: [{ id: "coffee", name: "Noor's roasted coffee", note: "Ask Noor about availability" }],
    active: true,
  },
];

export const PUBLISHED_ORIGIN = "https://rootsandroutesnoor.lovable.app";

/** Public listing URL — uses the live site when opened from the editor preview. */
export function listingUrl(hostId = "noor") {
  const origin =
    typeof window === "undefined" || /id-preview|lovableproject|localhost/.test(window.location.hostname)
      ? PUBLISHED_ORIGIN
      : window.location.origin;
  return `${origin}/farm?host=${hostId}`;
}
