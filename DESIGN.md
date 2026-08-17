---
name: AllPetcr.com
description: A pet-supply storefront rendered as the Heredia shop's own lit facade, translated to screen.
colors:
  facade-navy: "#092E5E"
  facade-navy-deep: "#07264D"
  facade-navy-muted: "#7B8A9D"
  facade-navy-ink-800: "#041326"
  storefront-gold: "#CC9539"
  storefront-gold-text: "#7F5B25"
  storefront-gold-text-min: "#96692A"
  warm-cream: "#FAF8F4"
  warm-cream-surface: "#F5F0E8"
  warm-cream-border: "#E6DFD4"
  white: "#FFFFFF"
typography:
  display:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 3.375rem)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.01em"
    fontFeature: "opsz 120"
  headline:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "2rem"
    fontWeight: 300
    lineHeight: 1.15
    fontFeature: "opsz 120"
  title:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "0.90625rem"
    fontWeight: 400
    lineHeight: 1.4
  price:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  body-light:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 300
    lineHeight: 1.6
  label:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.09em"
rounded:
  full: "9999px"
  card: "16px"
  lg: "8px"
spacing:
  gutter: "24px"
  section: "80px"
  card-padding: "20px"
  grid-gap: "20px"
components:
  button-primary:
    backgroundColor: "{colors.facade-navy}"
    textColor: "{colors.warm-cream}"
    rounded: "{rounded.full}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "{colors.facade-navy-deep}"
  button-inverse:
    backgroundColor: "{colors.warm-cream}"
    textColor: "{colors.facade-navy}"
    rounded: "{rounded.full}"
    padding: "14px 32px"
  button-confirmed:
    backgroundColor: "{colors.storefront-gold}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "14px 32px"
  card-product:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
    padding: "20px"
  input-field:
    backgroundColor: "{colors.warm-cream}"
    textColor: "{colors.facade-navy}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
---

# Design System: AllPetcr.com

## Overview

**Creative North Star: "The Lit Facade"**

The system is a screen translation of one physical thing: the Heredia store's own storefront, seen at dusk. Two navy bands bracket the page — the hero and the closing trust section — each carrying the same three-layer light treatment as the shop's actual facade: two warm halos at the upper corners (the side lanterns), a wider, fainter glow at center-top (the eave spotlights), and a thin gold line at the base of the dark band (the sign trim). Between those two dark bands, the page turns to warm cream — the interior, where the actual browsing and buying happens. Long reading (product grids, cards, forms) never sits on the dark surface; that would trade real conversion for atmosphere, and the physical store doesn't ask customers to shop in the dark doorway either.

Gold is the building's metal trim, not a paint color: it appears as a 3px hairline, small icon rings, and price-adjacent accents — never as a fill for anything large. Navy is the mass. Cream is the air. This is a deliberately two-and-a-half-color system, and the moment a third hue or a pure-white background enters the page body, the facade metaphor collapses into generic e-commerce.

The tone matching this world is **honest and unhurried**: a sober fixed hero instead of a carousel, one primary CTA instead of two competing ones, plain non-inflated pricing, and calm, explicit confirmations (a button that says "Added ✓" for two seconds, not a toast that vanishes before it's read). Nothing here performs urgency it doesn't have — there's no countdown timer, no "only 2 left," no fake scarcity — because the product's actual differentiator is that it never claims stock or savings it can't back up.

**Key Characteristics:**
- Two dark "facade" bands (hero, closing trust strip) bracket a light "interior" (everything transactional).
- Gold only ever appears as trim: hairlines, icon rings, small text accents — never a fill.
- Warm radial-gradient light replaces photography as the primary atmosphere device; it is pure CSS, adds no requests, and costs nothing on slow connections.
- Buttons are full pills everywhere; corners get harder (8px) only on cards and functional chrome.
- Motion is restrained and instant-feeling: 150–300ms color/transform transitions, never `transition-all`, always disabled under `prefers-reduced-motion`.

## Colors

The palette is not a stylistic choice — every value is sampled from the official logo file. One warm background family, one ink, one accent used sparingly: the system breaks the moment that ratio changes.

### Primary
- **Facade Navy** (#092E5E): The building mass. Body text ink on cream, and the solid fill for both dark page sections and primary buttons. This is the color the whole system organizes around.

### Secondary
- **Storefront Gold** (#CC9539): The sign's metal trim. Used only in small doses — hairline dividers, icon-ring strokes, category eyebrows, price-adjacent accents, and the cart-count badge. Never a background fill for anything larger than an icon ring or a badge.

### Neutral
- **Warm Cream** (#FAF8F4): Default page background — the shop interior's light. 
- **Warm Cream Surface** (#F5F0E8): Slightly deeper cream for banded sections that need to read as a distinct zone (e.g. the "Del catálogo" strip) without leaving the warm family.
- **Warm Cream Border** (#E6DFD4): The only border color on light surfaces — cards, inputs, dividers.
- **White** (#FFFFFF): Reserved for product-card backgrounds and photo mounts, so real product photography reads cleanly against a neutral field instead of competing with the warm page tone.

### Named Rules
**The One Accent Rule.** Gold covers a hairline, an icon ring, a badge, or text — never a surface. The instant gold fills a card or a button background at scale, it stops reading as metal and starts reading as yellow.

**The Text-Contrast Fork.** The 500-step brand gold (#CC9539) is for decoration only — 2.50:1 on cream fails WCAG AA. Any gold *text* on cream uses Storefront Gold Text (#7F5B25, 5.78:1) or, at minimum, #96692A (4.55:1). Gold reads correctly as text only when placed on the dark navy band instead (5.07:1) — that's why gold body copy only appears inside the hero/trust sections, never on cream.

## Typography

**Display Font:** Fraunces Variable (with Georgia, serif fallback)
**Body Font:** Inter Variable (with system-ui, sans-serif fallback)

**Character:** A light-weight (300) serif display face carries every headline — never bold, always with `opsz 120` optical sizing so large titles stay crisp instead of heavy — paired with a workmanlike Inter body. The pairing reads as considered rather than loud: nothing in the type system shouts, including the H1.

### Hierarchy
- **Display** (300, clamp(2.5rem, 5vw, 3.375rem) / 40–54px, line-height 1.05): The single H1 per page. Always the promise ("Everything for your pet, chosen with judgment"), never the brand name — the logo already carries that.
- **Headline** (300, 32px, line-height 1.15): Section titles ("Shop by category," "From the catalog").
- **Title** (400–500, 14.5–17px): Product names, card titles, step titles.
- **Body** (300–400, 14–15px, line-height 1.6): Descriptive copy, supporting text under headlines.
- **Label** (500, 11px, letter-spacing 0.09–0.14em, uppercase): Eyebrows ("Pet store in Heredia, Costa Rica"), category tags on product cards, badges.

### Named Rules
**The One H1 Rule.** Exactly one display-weight headline per page, and it is always the value proposition, never the repeated brand name.

## Layout

Content is capped at a 1180px container (`max-w-contenido`) with 24px side gutters at every breakpoint. Vertical rhythm between major sections is a consistent 80px (`py-20`); the two dark facade bands use a slightly tighter 64px (`py-16`) since they carry less content. Grids step from 1 column on mobile to 2 (sm) to 4 (lg) for category and product cards, with 16–20px gaps. The header is sticky with a translucent blurred cream background so the search bar and cart stay reachable through a 184-card catalog scroll.

The page's dark/light rhythm is itself a layout decision: dark hero → light interior (categories, featured products, "how it works") → dark trust band at the close. This mirrors walking into and out of the physical store and should be preserved as new top-level sections are added — a page that opens and closes light loses the facade framing entirely.

## Elevation & Depth

Mostly flat. Cards and inputs are separated by a 1px warm-cream border, not a shadow, at rest. Shadow only appears as a response to interaction — hover-lift on product cards, and the mega-menu / dropdown panels that need to visually float above content. Every shadow in the system is navy-tinted, not neutral black, so elevated surfaces stay inside the facade's color world instead of looking like a generic UI-kit default.

### Shadow Vocabulary
- **Card hover** (`box-shadow: 0 6px 24px rgba(11,49,97,0.09)`, paired with a 2px upward translate): The lift a product card gets on hover/focus.
- **Floating panel** (`box-shadow: 0 16px 48px rgba(9,46,94,0.13)`): Mega-menu dropdowns and any panel that overlays page content.

### Named Rules
**The Flat-at-Rest Rule.** Surfaces are flat and bordered by default. Shadow is earned only by hover, focus, or genuinely floating above other content — it's never decorative at rest.

## Shapes

Two radius languages coexist on purpose. Anything interactive and tappable — buttons, the search field's submit action, icon buttons, badges — is a **full pill** (9999px): it reads as touchable and matches the storefront's own rounded signage elements. Anything that *contains* content — product cards, category cards, the mega-menu panel, form panels — uses the **16px card radius**: soft enough to feel warm, not so round it looks like a button. Form inputs and smaller nav chrome (menu items, dropdown rows) sit at **8px**, a middle step that keeps functional UI feeling crisp without turning sharp-cornered.

### Named Rules
**The Pill-vs-Card Rule.** If it's something you press, it's a full pill. If it's something that holds other content, it's the 16px card radius. Mixing the two (a pill-shaped card, or a card-radius button) reads as an inconsistency, not a variation.

## Components

### Buttons
- **Shape:** Full pill (`rounded-full`), always.
- **Primary:** Facade Navy background, Warm Cream text, `14px 32px` padding. Hover deepens to Facade Navy Deep (#07264D).
- **Inverse (on navy sections):** Warm Cream background, Facade Navy text — used for the hero CTA, since a navy button on a navy section would disappear.
- **Confirmed state:** After a successful "add to cart," the button fills Storefront Gold for 2 seconds with a "✓" — the one moment gold is allowed to fill a whole surface, because it's a rare, momentary confirmation, not a resting state.
- **Ghost / link:** Underlined text in navy (or cream on dark), no fill — used for secondary actions like "Talk to us" next to a primary CTA.
- **Disabled:** Warm Cream Border background, muted navy text, `cursor-not-allowed` — used for out-of-stock "Sin existencias" buttons.

### Cards
- **Corner Style:** 16px (`rounded-card`).
- **Background:** White for product cards (so photography reads true); a color tint or photo with a navy scrim for category cards.
- **Shadow Strategy:** Flat with a border at rest; navy-tinted hover-lift shadow on interaction (see Elevation & Depth).
- **Border:** 1px Warm Cream Border, deepening slightly on hover.
- **Internal Padding:** 20px sides, ~16–20px top/bottom.

### Category Cards (signature component)
Photo or tint background with a two-layer navy scrim (a faint uniform base plus a stronger bottom gradient) guaranteeing text legibility over any photo, gold-ringed icon badge, display-font title, and a pill "Ver productos" tag that inverts color depending on whether a photo or flat tint sits behind it.

### Inputs / Fields
- **Style:** Warm Cream background, Warm Cream Border stroke, 8px radius, `12px 16px` padding.
- **Focus:** Border shifts to a lighter navy plus a soft ring (`focus:border-navy-400`, `focus-visible:ring-2 ring-navy-500`).
- **Error:** Border switches to red; never removes the focus ring behavior.

### Navigation
- Sticky header, translucent-blurred cream background. Desktop carries a mega-menu (hover + focus-triggered, closes on Escape with focus return) that only appears on sections with real subcategories — a section with no children never gets a false disclosure arrow. Mobile collapses to a full-width slide-down list with category icons for scanability. Nav item hover uses a soft cream-300 background wash, not an underline.

### Badges
- **Out of stock:** White/95 pill, translucent-blurred, thin cream border, small caps-style label.
- **Cart count:** Small gold-filled circle with navy-700 text — the other place gold is allowed to fill a surface, because it's tiny and informational, not decorative.

## Do's and Don'ts

### Do:
- **Do** keep gold to hairlines, rings, badges, and text on dark surfaces only.
- **Do** use the full-pill radius for anything pressable and the 16px card radius for anything that contains content.
- **Do** tint shadows with navy (`rgba(9,46,94,...)` / `rgba(11,49,97,...)`), never neutral black.
- **Do** keep the dark-band / light-interior / dark-band rhythm when adding new top-level page sections.
- **Do** use `dorado-700` or darker for any gold text on cream; reserve `dorado-500` for non-text surfaces.

### Don't:
- **Don't** fill a background, card, or button at rest with Storefront Gold — that's reserved for the two momentary/small exceptions (add-to-cart confirmation, cart-count badge).
- **Don't** use `dorado-500` for text on a cream background — it fails WCAG AA (2.50:1).
- **Don't** introduce a third hue or a pure-white page background; the system is built on exactly cream + navy + gold-as-accent.
- **Don't** use `transition-all` on repeated elements (product cards, buttons) — the catalog renders up to 184 at once, and only color/transform should be watched.
- **Don't** add a carousel, autoplay, or urgency-manufacturing UI (countdowns, fake low-stock flags) — it contradicts the "honest and unhurried" tone and the product's actual stock-accuracy commitment.
