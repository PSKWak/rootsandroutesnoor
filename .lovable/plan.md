# Offline feedback, Swahili SMS to Noor, two-way translation

## What visitors and Noor will see
- **Feedback works with no signal.** It is saved on the phone, even voice notes, and shows a clear status: Saved on this device → Waiting to sync → Synced (or Sync failed, with a Try again button). Nothing unsent is ever thrown away. Each piece of feedback is sent once only, even when it's retried.
- **Consent.** Before sending, visitors tick a short box: "Let Noor's helper (AI) read this to help her".
- **AI findings in Swahili.** Once feedback syncs, AI writes a summary, the mood, recurring themes and suggestions. What visitors actually said is kept apart from what AI suggests. The original words are always kept. Each result is time-stamped.
- **Real SMS to Noor, in simple Swahili.** It's short, fits a basic phone and contains no visitor names or contacts. Noor's settings get:
  - her phone number
  - how often to send: right away, daily or weekly
  - "Check before sending": preview the text, then approve it
- **SMS status:** Pending → Sent → Delivered or Failed. Delivered only shows once the phone company confirms it. Failed messages can be retried safely, with no double sends.
- **Noor can reply by SMS from a basic phone.** Her Swahili text appears in the visitor's Ask Noor chat, translated into the visitor's language, with the original Swahili shown under it.
- **Languages.** Visitors pick their language the first time they open the app and can change it any time. Noor's default is Swahili. Translations are labelled, and the original is always viewable. If the AI isn't sure about a translation, the message is held for review and isn't changed quietly.
- **Message statuses:** Saved offline, Awaiting translation, Ready to send, Sent, Delivered.
- **Demo mode.** A switch sends "simulated SMS" (clearly labelled) with sample feedback, so the demo costs nothing.

## Your choices, and one limitation
You chose "this phone only" for storage. That still works with real SMS: the app on the phone checks the text-message service for delivery updates and Noor's replies, so no online database is needed. The limitation is that Noor's replies and delivery updates only show on a phone that has the app open. To move everything online later, turn on Lovable Cloud.

## What you need to do
- Connect a **Twilio** account and pick a Twilio phone number. A connect card will appear.
- Turn on Twilio's SMS Pumping Protection and Geo Permissions, limited to Noor's country, to prevent fraud charges.

## Technical details
- Offline queue: IndexedDB for feedback and audio blobs, using an idempotency id per item. Sync runs on `online` events and on a back-off timer. The store keeps its interface (AGENTS rule).
- Server functions only (no Edge Functions, per project rules), in `src/lib/sms.functions.ts`:
  - `analyzeFeedback`: AI Gateway. Returns findings, suggestions, sentiment and Swahili SMS text plus a confidence score.
  - `sendSms`: Twilio `/Messages.json`, using the client id to dedupe.
  - `smsStatus`: GET Message SID.
  - `fetchNoorReplies`: list inbound messages from Noor's number since the last check, then translate them.
- Twilio credentials stay on the server. Noor's number is stored only on the device and only sent to the server when sending.
- The digest scheduler runs client-side (daily/weekly due check when the app opens) because there is no server storage.
- Tests cover: no duplicate sends on retry, Delivered only after provider confirmation, unsynced items are never deleted, low-confidence translations go to review.
