# Vastgoed Browaeys

Her-bouw van [vastgoedbrowaeys.be](https://vastgoedbrowaeys.be) — van Zabun/Zimmo-template naar eigen Next.js 16 + Supabase stack.

## Stack

- **Next.js 16** (App Router, React Compiler aan)
- **React 19**
- **Tailwind v4** (CSS-tokens via `@theme`)
- **TypeScript 5** strict
- **Supabase** (later — voor admin/CRM en pand-data)

## Design

Boutique-editorial richting: gebroken wit (`#faf8f4`), charcoal tekst, één diep petrol-accent (`#0b4f58`), Fraunces serif voor titels, Inter voor body. Veel witruimte, foto's bleed-to-edge, geen tekst-overlays op foto's.

## Folders

```
src/
  app/            App Router pages
  components/     Site-brede componenten (header, footer)
snapshot-zabun/   Lokale snapshot van oude site (niet in git)
```

## Lokaal draaien

```sh
npm install
npm run dev
```

## Status

Eerste scaffold — homepage met hero, uitgelicht aanbod (3 placeholder-cards), filosofie-blok, diensten-overzicht en CTA. Pand-detail, admin/CRM en Supabase-integratie volgen.
