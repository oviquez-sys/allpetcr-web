# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pet owners in Costa Rica's Greater Metropolitan Area (GAM), split roughly evenly between two situations rather than one dominant mode:

- **Local, in-person:** customers near the Heredia Central store who browse the catalog online, then message WhatsApp to confirm stock/price before visiting, or pay and pick up in-store.
- **Remote, delivery:** customers elsewhere in the GAM who order via WhatsApp and receive the order through the courier service (Seltransa; see `ENVIOS/` at the project root for the carrier's coverage brochure).

The job in both cases is the same: browse a real, currently-in-stock catalog, decide what to buy, and hand off to WhatsApp to close the order — the site itself never takes payment.

## Product Purpose

AllPetcr.com is the online storefront for AllPet (legal name AllPetcr), a pet-supply store in Heredia Central, Costa Rica. It lets customers browse the store's actual catalog (categories, products, prices, photos where available) and start an order that gets confirmed and fulfilled over WhatsApp — either in-store pickup or GAM delivery. Success is a visitor finding what they need, trusting that it's really in stock at that price, and completing the WhatsApp handoff without confusion.

## Positioning

A curated, honest selection: the catalog isn't the biggest possible assortment, it's a deliberately chosen one, described in plain, non-inflated terms customers can trust. This is reinforced structurally — the site shows only what the ERP confirms is in stock; a sold-out product disappears from the catalog and its page stops existing rather than staying up as a phantom listing. A competitor could copy the product list but not the discipline of only ever showing what's true and in stock.

## Operating Context

- **Two-system architecture:** a separate internal ERP (`allpetcr-erp`, Django) is the source of truth for products, prices, and stock. It exports to this site's `data/*.json` and `public/productos/` via a one-way command (`exportar_catalogo_web`) run by hand when data changes. The ERP has no live API yet — this is a known gap, not a design choice to route around.
- **No online payment.** Deliberate, not an oversight: accepting cards requires a merchant account and resolving e-invoicing, which the store's simplified tax regime (Régimen de Tributación Simplificada) cannot currently issue. The checkout flow ends at a WhatsApp message with the order, name, phone, and delivery mode; the store confirms stock and total before committing.
- **Fulfillment is either in-store pickup (Heredia Central) or GAM delivery via a third-party courier (Seltransa).**
- **Pricing/stock integrity is enforced in code:** the cart never charges for out-of-stock items and always uses the catalog's current price, not the price at add-to-cart time; changes are surfaced explicitly rather than silently adjusted.
- **Costs and margins never reach the site.** The ERP export omits them by design, and exact stock counts are reduced to a boolean "available" — revealing quantities would hand a competitor the store's volume.

## Capabilities and Constraints

- Catalog navigation follows the real inventory distribution (toys/collars are ~67% of stock), not an aspirational species-based taxonomy — the ERP has no reliable species field for ~96% of products, so a Dogs/Cats split would silently misfile most items. This is a durable data constraint, not a temporary limitation.
- Category links must resolve by id (`?cats=`), never by name — enforced by `lib/enlaces.test.ts`; navigation lives only in `lib/navegacion.ts`.
- `data/` and `public/productos/` are generated files; they are overwritten by the next ERP export and must not be hand-edited.
- WCAG AA color contrast is an existing hard constraint, already encoded in the palette (`dorado-700`/`dorado-650` required for text on cream, not the brand `dorado-500`).
- Product photography exists (organized by category under `IMAGENES/` at the project root) but is currently disabled in the ERP export (`INCLUIR_IMAGENES`); enabling it requires migrating image handling to `next/image` first.
- The production build intentionally fails if required business fields in `lib/negocio.ts` are still placeholder (`PENDIENTE`) or, for the legal ID, still the known-fake value — this is a deliberate publish gate, not a bug to work around.

## Brand Commitments

- Name: "AllPet" (display), legal name "AllPetcr".
- Palette is sampled directly from the official logo, not an aesthetic choice: navy `#092E5E` (ink), dorado `#CC9539` (accent, small doses only, `dorado-700`/`-650` for text), warm cream/arena backgrounds. One background family, one ink, one accent — adding a third color or pure white breaks the system.
- Typography: Fraunces Variable (display) + Inter Variable (sans), self-hosted via `@fontsource` — no external font requests.
- WhatsApp is the confirmed, intentional order channel (matches where Costa Rican customers already are), not a stopgap for a missing payment gateway.

## Evidence on Hand

- Real product catalog exported from the ERP: 184 products live in `data/productos.json` at last export (the ERP holds a larger, more current inventory — see `allpetcr-erp/ACTUALIZAR_INVENTARIO.txt` — pending sync).
- Real product photography exists per-category under `IMAGENES/` at the project root but is not yet wired into the site (see Capabilities and Constraints).
- Logo assets (original, monochrome navy, monochrome gold, vectorized SVG) under `LOGOS/` at the project root.
- Real business contact fields are partially filled in `lib/negocio.ts` (WhatsApp number, phone, address, hours); the legal ID (`cedulaJuridica`) is still a known-placeholder value and blocks publishing until replaced with the real one from the ERP's `Empresa.identificacion`.
- Do not fabricate testimonials, review counts, "years in business" claims, or delivery-time promises — none are confirmed on hand.

## Product Principles

1. Never show or imply stock, pricing, or availability the ERP hasn't confirmed — silent overselling or phantom listings break the one thing this store can credibly claim over bigger competitors.
2. Navigation and copy follow the catalog that actually exists, not the one that would look more complete — an aspirational category that's mostly empty is worse than no category.
3. WhatsApp is the real transaction channel, not a fallback; the site's job is to get a visitor to a well-formed WhatsApp order, not to simulate a checkout it can't fulfill.
4. Every business fact (legal ID, phone, address, hours) is single-sourced from `lib/negocio.ts` — no hand-written duplicates anywhere else in the site.
5. Accessibility (WCAG AA contrast, 44px tap targets, reduced-motion, skip links) is baseline, not a later pass.

## Accessibility & Inclusion

WCAG AA is an established, encoded requirement (see Brand Commitments and Capabilities): 4.5:1 text contrast is enforced through the palette's `-700`/`-650` steps, 44px touch targets and `prefers-reduced-motion` are already implemented sitewide, and a skip-link satisfies WCAG 2.4.1.
