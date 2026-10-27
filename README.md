# nys-feedback

`nys-feedback` is a sample New York State Design System (NYSDS) web component,
built with [Lit](https://lit.dev), that asks people to rate an experience they
just finished. This repository hosts the component inside a copy of the
[NYSDS Playground](https://github.com/ITS-HCD/nysds-playground), so you can try
it, read its code, and edit it live in the browser.

Live demo: https://its-hcd.github.io/component-feedback/

This is a prototype, not a released NYSDS component.

## What it looks like

- **Wide containers** (40rem and up) show the question and description on the
  left and two filled buttons on the right, one row.
- **Narrow containers** stack everything in one centered column, with the
  buttons below the text.
- For two seconds after it first renders, the component takes no space, so
  the page reads as if it weren't there. Then it opens downward, pushing the
  content below it down, while its contents fade in and drift down into place.
  A component that's already `submitted` when it first renders skips the
  entrance, because a finished form shouldn't draw attention, and resetting it
  later doesn't replay the entrance either.
- After someone answers, the buttons fade out, the panel shrinks to fit, and a
  thank-you message rises into place while its check icon pops. Focus moves
  to that message.
- Every animation is CSS only. With `prefers-reduced-motion`, nothing moves:
  the component opens at once and fades in, the panel changes height without
  animating, and the outgoing step disappears while the incoming one fades in.

The layout follows the component's own width through a container query, so it
adapts inside a sidebar the same way it does on a phone.

The design uses NYSDS tokens for color, spacing, type, radius, and elevation:
a white frame with a light border, `--nys-shadow-raised`, and
`--nys-radius-xl`, around a `--nys-color-theme-faint` panel.

## Use it

```html
<nys-feedback
  heading="How did we do?"
  text="You just renewed your professional license."
></nys-feedback>

<script type="module">
  document.querySelector('nys-feedback').addEventListener('nys-feedback', (event) => {
    console.log(event.detail.value); // "good" or "needs-improvement"
  });
</script>
```

The page needs the NYSDS styles and components loaded, because
`nys-feedback` renders `nys-button` and `nys-icon` and reads `--nys-*` tokens.

### Attributes and properties

| Attribute | Default | Description |
| --- | --- | --- |
| `heading` | `How did we do?` | The question. |
| `text` | (empty) | Names the experience the question is about. |
| `positiveLabel` | `Good` | Label for the positive answer. |
| `negativeLabel` | `Needs improvement` | Label for the negative answer. |
| `confirmationText` | `Thanks for your feedback.` | The message that replaces the buttons. |
| `submitted` | `false` | Shows the thank-you message. Reflects. |
| `value` | (empty) | The answer: `good` or `needs-improvement`. Reflects. |

### Events

| Event | Detail | Description |
| --- | --- | --- |
| `nys-feedback` | `{value, label}` | Fires once when someone answers. Bubbles and is composed. |

### CSS custom properties

| Property | Default | Description |
| --- | --- | --- |
| `--nys-feedback-entrance-delay` | `2s` | How long to wait before the component animates in. |

NYSDS has no motion tokens, so the component sets its own durations and
easing.

### Methods

| Method | Description |
| --- | --- |
| `reset()` | Clears the answer and shows the buttons again, without an entrance. |
| `animateIn()` | Plays the entrance animation again, delay included. |

## The demo

The site opens on the **nys-feedback** deck, which has two slides.

- **Confirmation page and event log**: a license renewal confirmation page,
  with nys-feedback in the spot where the page had a divider, between the
  license card and "What's next?" An event log sits beside the page.
  Choosing **Good** logs `event fired: good`, and choosing **Needs
  improvement** logs `event fired: needs improvement`. The demo then sets a
  session cookie named `nys-feedback`, so a reload shows the thank-you message
  right away, with no entrance, until the browser session ends. Select **Clear
  cookie** to delete it and answer again, or **Replay entrance** to watch the
  entrance animation again.
- **Layouts**: the wide, narrow, and answered states side by side.

The playground preview runs in a cross-site iframe, so the cookie is set with
`SameSite=None; Secure; Partitioned`. A browser that blocks all cookies in
iframes, such as Safari with default settings, can reject it. The log says so
when that happens.

The once-per-session rule lives in the demo script, not the component. The
component only knows whether it's `submitted`, so each app can decide how to
remember an answer.

## Repository layout

| Path | What it holds |
| --- | --- |
| `component/nys-feedback.js` | The Lit component. Plain JavaScript, so it runs in the playground as is. |
| `demo/` | The HTML, CSS, and JavaScript for each demo slide. |
| `scripts/build-deck.mjs` | Builds `decks/nys-feedback.json` from `component/` and `demo/`. |
| `decks/nys-feedback.json` | The generated starter deck. Don't edit it by hand. |
| Everything else | The NYSDS Playground app, copied from ITS-HCD/nysds-playground 0.2.0. |

Each slide's JavaScript starts with the whole component, followed by the
slide's own script, so the playground shows and runs the real source.

### Changes from the upstream playground

- A bare URL opens the `nys-feedback` deck. Add `?home` to reach the home page.
  The setting is `defaultDeck` in `src/playground.config.ts`.
- Decks save under their own key prefix, so they don't mix with the main
  playground's decks. Both sites share the `its-hcd.github.io` origin, and so
  the same IndexedDB store.
- The code drawer starts closed, so the first thing a visitor sees is the
  whole demo page. A **Code** button in the slide bar, or the `c` key, opens
  it, and the choice is remembered. The setting is `codeCollapsedByDefault` in
  `src/playground.config.ts`.
- Settings save under their own localStorage prefix, for the same reason as
  the decks.
- The preview scrolls past the code drawer. The drawer floats over the bottom
  of the preview, so upstream, the end of a long slide sits behind it with
  nothing to scroll. The host now tells the preview how much the drawer covers,
  and the preview adds that much room at the bottom.

For everything else about the playground, see the
[NYSDS Playground README](https://github.com/ITS-HCD/nysds-playground#readme).

## Develop

Prerequisites: Node.js 20 or newer.

1. Run `npm install`.
2. Run `npm run dev`. It rebuilds the deck from `component/` and `demo/`, then
   starts the dev server.

Starter decks only seed a browser once. After you change the component or a
demo file, open `?home` and select **Restore starter decks**, or delete the
deck there first, to load the new version.

`npm run build` rebuilds the deck, type-checks, and builds to `dist/`.
`npm test` runs the playground's unit tests.

## Deploy

A push to `main` runs `.github/workflows/deploy.yml`, which builds the app and
deploys `dist/` to GitHub Pages.
