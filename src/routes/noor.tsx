import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/noor")({
  head: () => ({
    meta: [
      { title: "Noor's companion — Rooted" },
      { name: "description", content: "Simple host view: listen to visitors, reply by voice, decide on bookings." },
      { property: "og:title", content: "Host companion — Rooted" },
      { property: "og:description", content: "A simple, voice-first view for local hosts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <Outlet />,
});
