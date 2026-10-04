<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- App state lives in `src/lib/store.ts` (localStorage-backed external store); swap for a backend later without touching screens.
- All ElevenLabs and AI calls go through server functions in `src/lib/*.functions.ts`; keys are never read in browser code.
- Noor's own recordings are never replaced by synthetic voice; read-aloud is only for translations and must be labelled.
- Farm calendar, location, transport and terrain live in src/lib/farm-info.ts as editable data; screens never hard-code them.
- Scroll-revealed sequences gate nested motion through the `Reveal` wrapper's `data-shown` attribute plus a `.seq` class (animation-play-state: paused), rather than one observer per item — so a multi-step sequence plays in order once, and stays completely still for visitors who prefer reduced motion.
