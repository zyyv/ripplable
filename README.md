# ripplable

`ripplable` is a `pnpm` workspace monorepo with a root-level Vue playground app and a reusable `ripplable` package.

## Structure

```text
.
├─ playground/    # Vue + Vite playground app
├─ packages/
│  └─ ui/         # shared UI package
├─ eslint.config.js
├─ pnpm-workspace.yaml
└─ tsconfig.base.json
```

## Workspace

- Package manager: `pnpm`
- Workspace packages: `playground`, `packages/*`
- Shared dependency versions: `pnpm-workspace.yaml` via `catalog:`
- Lint config: `@antfu/eslint-config`
- Runtime: Vue 3
- Styling: hand-written CSS, no Tailwind or UI primitive library

## Scripts

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

## Packages

- `@ripplable/playground`: local sandbox for motion and UI experiments
- `ripplable`: reusable component package consumed by the playground
