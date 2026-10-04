# Offline feedback, Swahili messages to Noor, two-way translation (no paid services)

## What visitors and Noor will see
- **Feedback works with no signal.** It's saved on the phone, even voice notes, and shows a status: Saved on this device, then Waiting to sync, then Synced. If syncing fails it shows Sync failed with a Try again button. Nothing unsent is ever lost, and nothing is sent twice.
- **Consent.** Before sending, the visitor ticks a short box: "Let Noor's helper (AI) read this to help her."
- **AI findings in Swahili.** Once feedback syncs, the AI writes a short summary with:
  - the mood
  - recurring themes
  - suggestions

  What visitors actually said is shown separately from what the AI suggests. The original words are always kept, and each summary is dated.
- **Messages to Noor without a paid SMS service:**
  - The app writes a short, simple Swahili text for a basic phone, with no visitor names or contacts.
  - Noor's settings hold her phone number and how often a text is prepared: right away, daily, or weekly.
  - Each text is shown as a preview. A big "Send by SMS" button then opens the phone's own messages app with the text already filled in. It goes out through that phone's normal plan, with nothing extra to pay.
  - Statuses: Ready to send, Opened in messages app, Marked sent. The app never says "Delivered" because it can't confirm delivery without a paid service.
  - A demo switch shows "simulated SMS", clearly labelled.
- **Noor's replies.** She records her reply in Swahili in the app, as she does today. If she texts a reply from a basic phone, whoever has the shared phone can paste it into "Add Noor's SMS reply". Either way it's translated into the visitor's language, with the original Swahili shown underneath.
- **Languages.** Visitors pick their language the first time they open the app and can change it any time. Noor's language starts as Swahili. Translations are labelled and the original can always be viewed. If the AI isn't sure about a translation, it holds the message for review instead of quietly changing its meaning.
- **Message statuses:** Saved offline, Awaiting translation, Ready to send, Sent, Delivered. Delivered applies only to in-app messages.

## Limits of going free
- Texts aren't sent automatically, so someone taps "Send by SMS" each time.
- A text Noor sends from a basic phone doesn't reach the app by itself; it has to be pasted in.
- Everything stays on this phone, as you chose.

## Technical details
- IndexedDB queue for feedback and audio, using an idempotency id per item. Sync runs on `online` and on a back-off timer. The store interface stays the same.
- Server functions (AI Gateway, already in the project): `analyzeFeedback` returns findings, suggestions, sentiment, the Swahili SMS text and a confidence score. `translateText` is reused, with a confidence check for review.
- SMS is an `sms:<number>?body=` link. There is no SMS provider or credentials.
- Digest timing is checked when the app opens.
- Tests cover:
  - no duplicate syncs
  - unsynced items are never deleted
  - "Delivered" never appears for SMS
  - low-confidence translations go to review
