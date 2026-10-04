/**
 * Editable farm information. Everything here is PLACEHOLDER demo data until
 * Noor confirms the real farm calendar, location, transport and terrain.
 * Update values here — the screens read only from this file.
 */

export const FARM_INFO_IS_PLACEHOLDER = true;

export type Activity = "flowering" | "growing" | "harvest" | "drying" | "roasting" | "quiet";
export type Availability = "High" | "Medium" | "Limited";

export const ACTIVITIES: Record<Activity, { icon: string; label: string; desc: string }> = {
  flowering: { icon: "🌸", label: "Flowering", desc: "Coffee plants are in flower." },
  growing: { icon: "🌱", label: "Growing", desc: "Cherries are growing on the plants." },
  harvest: { icon: "🧺", label: "Harvest season", desc: "Coffee cherries are being harvested." },
  drying: { icon: "☀️", label: "Drying", desc: "Beans are washed and dried in the sun." },
  roasting: { icon: "🔥", label: "Roasting & processing", desc: "Dried beans are processed and roasted." },
  quiet: { icon: "🌿", label: "Quiet season", desc: "A quieter period with fewer farm activities." },
};

export type MonthInfo = {
  month: string;
  activity: Activity;
  canParticipate: boolean;
  experiences: string[]; // experience ids from store EXPERIENCES
  availability: Availability;
  rainy: boolean;
  note?: string;
};

const ALL = ["walk", "process", "lunch"];

// PLACEHOLDER calendar — not the real Ondera Highlands seasons.
export const CALENDAR: MonthInfo[] = [
  { month: "January", activity: "drying", canParticipate: true, experiences: ALL, availability: "Medium", rainy: false },
  { month: "February", activity: "roasting", canParticipate: true, experiences: ["process", "lunch"], availability: "Medium", rainy: false },
  { month: "March", activity: "flowering", canParticipate: false, experiences: ["walk", "lunch"], availability: "Medium", rainy: true },
  { month: "April", activity: "harvest", canParticipate: true, experiences: ALL, availability: "High", rainy: true },
  { month: "May", activity: "harvest", canParticipate: true, experiences: ALL, availability: "High", rainy: true },
  { month: "June", activity: "drying", canParticipate: true, experiences: ALL, availability: "Medium", rainy: false },
  { month: "July", activity: "roasting", canParticipate: true, experiences: ["process", "lunch"], availability: "Medium", rainy: false },
  { month: "August", activity: "quiet", canParticipate: false, experiences: ["walk", "process"], availability: "Limited", rainy: false },
  { month: "September", activity: "quiet", canParticipate: false, experiences: ["walk", "process"], availability: "Limited", rainy: false },
  { month: "October", activity: "flowering", canParticipate: false, experiences: ["walk", "lunch"], availability: "Medium", rainy: true },
  { month: "November", activity: "growing", canParticipate: true, experiences: ["walk", "lunch"], availability: "Medium", rainy: true },
  { month: "December", activity: "growing", canParticipate: true, experiences: ALL, availability: "Medium", rainy: false },
];

/** Months (by name) when an experience is offered. */
export function monthsFor(experienceId: string): string[] {
  return CALENDAR.filter((m) => m.experiences.includes(experienceId)).map((m) => m.month);
}

export function monthIndexFromDate(date: string): number | null {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d.getUTCMonth();
}

export const LOCATION = {
  nearestTown: "[Nearest town — to be confirmed by Noor]",
  farm: "[Farm location — to be confirmed by Noor]",
};

export type PickupAvailability = "Yes" | "No" | "By request";

export const TRANSPORT = {
  // Only list options Noor confirms. Placeholders until then.
  options: [
    { icon: "🚗", label: "Private vehicle", note: "[Route details to be confirmed]" },
    { icon: "🚕", label: "Local taxi", note: "[Availability to be confirmed]" },
    { icon: "🚐", label: "Pickup from the nearest town", note: "Arranged with Noor" },
  ],
  pickup: "By request" as PickupAvailability,
  pickupFrom: "[Pickup point — to be confirmed]",
};

/** Confirmed by Noor: the farm is 2 hectares and a visit covers about 1 km on foot. */
export const FARM_SIZE = {
  hectares: 2,
  walkingKm: 1,
};

export const TERRAIN = [
  { icon: "🥾", label: "Terrain", value: "[To be confirmed] — may be uneven or steep in some areas" },
  { icon: "🌧️", label: "Rain", value: "Paths may become muddy in rainy months" },
  {
    icon: "🚶",
    label: "Walking",
    value: `About ${FARM_SIZE.walkingKm} km of walking across the ${FARM_SIZE.hectares}-hectare farm`,
  },
  { icon: "👟", label: "Recommended footwear", value: "Comfortable walking shoes" },
  { icon: "ℹ️", label: "Accessibility", value: "[To be confirmed] — some areas may have limited accessibility" },
];
