# Čanković Wedding Films — refined V1

This build keeps the old cinematic sticky Hero and minimal footer, while using the newer About, Process, Selected Weddings, Testimonials and Availability/Booking system.

## Refinements in this build

- Mobile testimonials are smaller and no longer overlap the next section.
- Mobile fullscreen navigation is lighter, calmer and less oversized.
- Selected Weddings now sits on the off-white editorial background instead of a large dark block.
- Development film placeholders are light editorial placeholders; real films will replace them later.
- FAQ was removed from the homepage because the same practical information is already covered naturally in About/Process/Booking and the section interrupted the cinematic flow.
- Lazar biography was rewritten closer to his own supplied biography and wording.
- Phone field now includes a clean calling-code selector plus the local number.
- Burgundy `#2B060E` is intentionally restricted to micro-interactions: selected date, form focus, small hover/active details. Hero CTA is neutral until hover.

## Replace assets

Hero showreel:
`assets/videos/hero-showreel.mp4`

Logo:
`assets/logo/logo-light.svg`
`assets/logo/logo-dark.svg`

Blosta:
`assets/fonts/Blosta.woff2`

Lazar portrait:
`assets/images/lazar-placeholder.svg`

Portfolio preview/full videos:
see `index.html` and `js/video.js`.

Testimonials:
`js/translations.js`

Mock booked dates / future Google Calendar hook:
`js/calendar.js`

## Run locally

Use VS Code Live Server, or:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.


## Country calling-code picker
The phone field now uses a custom searchable picker rather than the browser's native `<select>`. It contains a broad international calling-code dataset (Europe, the Americas and the rest of the world where data is available), supports keyboard navigation, and submits both `countryCode` and `countryIso`.
