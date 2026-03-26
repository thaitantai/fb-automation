# Frontend UI Framework Initialization

The objective here is to turbo-charge your Next.js frontend with robust styling utility classes (Tailwind CSS is already present) and a beautifully architected generic UI component library (**Shadcn UI**). We will stick strictly to standard configurations designed for modern Dashboard/SaaS systems.

## Proposed Changes

### Configuration Setup
- Use `npx shadcn@latest init -d` inside `apps/web` to automatically generate `components.json`, inject standard CSS variables into your `globals.css`, and update tailwind configuration with required plugins (like `tailwindcss-animate`).

### Directory Adjustments
**Shadcn UI** fundamentally relies on placing generic UI code right inside your module folder allowing heavy customization instead of hiding it inside node_modules.

#### [NEW] `apps/web/components.json`
- Stores paths for the Shadcn UI CLI. Standardizing paths to:
  - components: `src/components/ui`
  - utils: `src/lib/utils`

#### [MODIFY] `apps/web/tailwind.config.ts`
- Will be expanded heavily by CLI to incorporate the `css-variables` driven theme system allowing easy Light/Dark modes.

#### [MODIFY] `apps/web/src/app/globals.css` (or equivalent)
- Injects a standard styling root (e.g. HSL color theme values for primary, secondary, destructive, border, background variables) and Dark mode overrides.

#### [NEW] `apps/web/src/lib/utils.ts`
- Will contain the standard `cn()` utility (`clsx` + `tailwind-merge`) that resolves tailwind class caching clashes efficiently.

### Adding Basic Component Blocks
- Immediately install fundamental generic UI parts that every project needs immediately:
  - `Button`
  - `Input`
  - `Card` 
  - `Table`

## Verification Plan
1. We will visually inspect the `lib/utils.ts` and `tailwind.config.ts`.
2. Ensure everything compiles with no Missing Dependency alerts via `pnpm build`.
