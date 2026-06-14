# Lu Bu Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, playable React prototype for 《乱世人心：吕布来投》 with 9 decision turns, turn 10 ending evaluation, local rule engines, Tailwind CSS, shadcn/ui, and a War Dossier UI style.

**Architecture:** The app is a pure frontend simulation. `WorldState` lives in Zustand, UI submits only `choiceId`, and engine modules own effects, risk, director selection, NPC decisions, reports, and endings. Story content is TypeScript data, not hardcoded in components.

**Tech Stack:** Vite, React, TypeScript, Zustand, Tailwind CSS, shadcn/ui, Vitest, Testing Library, lucide-react.

---

## Spec Source

Use this file as the implementation source of truth:

- `docs/superpowers/specs/2026-06-14-lu-bu-demo-design.md`

Important locked decisions:

- Playable turns: 1-9.
- Turn 10: ending display and evaluation, no normal choices.
- Early failure endings immediately stop progression and skip turn increment and Director selection.
- UI style: `War Dossier`, not generic dashboard, not 三国手游卡牌, not仿古卷轴.
- UI stack: Tailwind CSS + shadcn/ui.
- Responsive behavior: desktop two-column, mobile single-column with event panel first.

## File Structure

Create or modify these files:

```text
package.json
index.html
vite.config.ts
tsconfig.json
tsconfig.node.json
tailwind.config.ts
postcss.config.js
components.json
src/main.tsx
src/App.tsx
src/index.css
src/lib/utils.ts
src/core/types/character.ts
src/core/types/world.ts
src/core/types/effect.ts
src/core/types/event.ts
src/core/types/ending.ts
src/core/data/initialWorld.ts
src/core/data/events.ts
src/core/data/endings.ts
src/core/engine/pathUtils.ts
src/core/engine/effectEngine.ts
src/core/engine/conditionEngine.ts
src/core/engine/riskEngine.ts
src/core/engine/directorEngine.ts
src/core/engine/npcEngine.ts
src/core/engine/reportEngine.ts
src/core/engine/endingEngine.ts
src/store/worldStore.ts
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/badge.tsx
src/components/ui/separator.tsx
src/components/ui/alert.tsx
src/components/ui/collapsible.tsx
src/components/layout/AppShell.tsx
src/components/layout/HeaderBar.tsx
src/components/panels/DashboardPanel.tsx
src/components/panels/CharacterPanel.tsx
src/components/panels/EventPanel.tsx
src/components/panels/ChroniclePanel.tsx
src/components/panels/EndingPanel.tsx
src/components/panels/DebugPanel.tsx
src/components/game/MetricCard.tsx
src/components/game/CharacterCard.tsx
src/components/game/DecisionButton.tsx
src/components/game/StatusBadge.tsx
src/tests/setup.ts
src/core/engine/effectEngine.test.ts
src/core/engine/directorEngine.test.ts
src/core/engine/endingEngine.test.ts
src/store/worldStore.test.ts
README.md
.gitignore
```

Responsibilities:

- `core/types/*`: Shared domain contracts.
- `core/data/*`: Initial world, all events, all endings.
- `core/engine/*`: Pure functions, no React.
- `store/worldStore.ts`: Orchestrates one player choice through the game loop.
- `components/ui/*`: shadcn-compatible primitives.
- `components/panels/*`: Product UI panels.
- `components/game/*`: Smaller game-specific visual components.

---

## Task 1: Scaffold Project and Tooling

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `components.json`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src/lib/utils.ts`
- Create: `src/tests/setup.ts`
- Modify: `README.md`

- [ ] **Step 1: Create package metadata**

Create `package.json` with scripts and dependencies:

```json
{
  "name": "lu-bu-demo",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@radix-ui/react-collapsible": "^1.1.2",
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "tailwind-merge": "^2.5.5",
    "zustand": "^5.0.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^6.0.3",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create Vite entry files**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>乱世人心：吕布来投</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 3: Create TypeScript and Vite config**

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
  },
});
```

- [ ] **Step 4: Create Tailwind and shadcn-compatible config**

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"PingFang SC\"",
          "\"Noto Sans CJK SC\"",
          "sans-serif",
        ],
        mono: ["ui-monospace", "\"SF Mono\"", "\"JetBrains Mono\"", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

Create `postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Create `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 5: Create global CSS tokens**

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 84 18% 96%;
    --foreground: 210 15% 11%;
    --card: 60 45% 98%;
    --card-foreground: 210 15% 11%;
    --primary: 174 40% 31%;
    --primary-foreground: 160 100% 98%;
    --muted: 90 16% 91%;
    --muted-foreground: 132 5% 43%;
    --accent: 174 40% 31%;
    --accent-foreground: 160 100% 98%;
    --destructive: 6 45% 47%;
    --destructive-foreground: 0 0% 100%;
    --warning: 36 72% 42%;
    --warning-foreground: 50 100% 97%;
    --info: 204 18% 38%;
    --info-foreground: 204 100% 97%;
    --border: 84 17% 85%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply min-h-[100dvh] bg-background text-foreground antialiased;
  }

  button {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background;
  }
}
```

- [ ] **Step 6: Create utilities and smoke App**

Create `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Create temporary `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="min-h-[100dvh] p-6">
      <h1 className="text-2xl font-semibold">乱世人心：吕布来投</h1>
      <p className="mt-2 text-muted-foreground">项目脚手架已启动。</p>
    </main>
  );
}
```

Create `src/tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 7: Install dependencies**

Run:

```bash
npm install
```

Expected: dependencies installed and `package-lock.json` created.

- [ ] **Step 8: Verify scaffold**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: typecheck passes, tests report no test files or pass, build succeeds.

- [ ] **Step 9: Commit scaffold**

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.ts postcss.config.js components.json src .gitignore README.md
git commit -m "chore: scaffold lu bu demo app"
```

---

## Task 2: Domain Types and Initial World

**Files:**
- Create: `src/core/types/character.ts`
- Create: `src/core/types/world.ts`
- Create: `src/core/types/effect.ts`
- Create: `src/core/types/event.ts`
- Create: `src/core/types/ending.ts`
- Create: `src/core/data/initialWorld.ts`

- [ ] **Step 1: Define character types**

Create `src/core/types/character.ts` with:

```ts
export type CharacterId =
  | "cao_cao"
  | "lv_bu"
  | "xun_yu"
  | "xiahou_dun"
  | "zhang_liao"
  | "chen_gong"
  | "yuan_shao_envoy";

export type Trait =
  | "ambitious"
  | "loyal"
  | "prideful"
  | "greedy"
  | "volatile"
  | "cautious"
  | "righteous"
  | "suspicious"
  | "vengeful";

export type MentalState = {
  loyalty: number;
  trust: number;
  fear: number;
  ambition: number;
  grievance: number;
  gratitude: number;
  pride: number;
  insecurity: number;
  belonging: number;
  perceivedPower: number;
};

export type Relationship = {
  targetId: CharacterId;
  trust: number;
  respect: number;
  fear: number;
  resentment: number;
  rivalry: number;
  affection: number;
  obligation: number;
};

export type Character = {
  id: CharacterId;
  name: string;
  factionId: string;
  stats: {
    martial: number;
    strategy: number;
    politics: number;
    charisma: number;
  };
  traits: Trait[];
  mentalState: MentalState;
  relationships: Partial<Record<CharacterId, Relationship>>;
  titles: string[];
  armyControl: number;
  status: "active" | "imprisoned" | "executed" | "defected";
};
```

- [ ] **Step 2: Define world, effect, event, ending types**

Create `src/core/types/effect.ts`:

```ts
export type EffectOp = "+" | "-" | "set";

export type Effect = {
  target: string;
  op: EffectOp;
  value: number | string | boolean;
};
```

Create `src/core/types/event.ts`:

```ts
import type { Effect } from "./effect";

export type ChoiceTag =
  | "military"
  | "political"
  | "risky"
  | "stable"
  | "trust_lubu"
  | "suppress_lubu"
  | "appease_old_guard"
  | "convert_zhang_liao"
  | "investigation"
  | "promise"
  | "trap";

export type EventChoice = {
  id: string;
  label: string;
  description: string;
  tags: ChoiceTag[];
  effects: Effect[];
  report: string;
};

export type StoryEvent = {
  id: string;
  title: string;
  theme: string;
  description: string;
  turnRange?: [number, number];
  priority: number;
  condition?: string;
  choices: EventChoice[];
};
```

Create `src/core/types/ending.ts`:

```ts
export type EndingId =
  | "camp_rebellion"
  | "lubu_defects_to_yuan"
  | "killed_tiger_left_wound"
  | "tiger_in_cage"
  | "zhangliao_joins_cao"
  | "win_with_tiger"
  | "tense_success"
  | "failed_balance";

export type Ending = {
  id: EndingId;
  title: string;
  description: string;
  evaluation: string;
  tone: "success" | "mixed" | "failure";
};
```

Create `src/core/types/world.ts`:

```ts
import type { Character, CharacterId } from "./character";
import type { EndingId } from "./ending";

export type WorldMetrics = {
  turn: number;
  internalStability: number;
  yuanShaoPressure: number;
  oldGuardPressure: number;
  surrenderedFactionRisk: number;
  militaryReadiness: number;
  rulerPrestige: number;
  rumorLevel: number;
};

export type LuBuArcState = {
  betrayalRisk: number;
  defectionIntent: number;
  rebellionIntent: number;
  integrationProgress: number;
  militaryDependence: number;
  chenGongInfluence: number;
  yuanShaoContact: number;
};

export type PromiseRecord = {
  id: string;
  fromCharacterId: CharacterId;
  toCharacterId: CharacterId;
  content: string;
  importance: number;
  status: "active" | "fulfilled" | "broken";
  createdTurn: number;
};

export type ChronicleItem = {
  id: string;
  turn: number;
  title: string;
  content: string;
  type: "event" | "choice" | "report" | "warning" | "npc" | "ending";
};

export type GameEndingState = {
  id: EndingId;
  triggeredTurn: number;
  reason: string;
  early: boolean;
};

export type WorldState = {
  metrics: WorldMetrics;
  characters: Record<CharacterId, Character>;
  luBuArc: LuBuArcState;
  currentEventId: string;
  resolvedEventIds: string[];
  promises: PromiseRecord[];
  chronicle: ChronicleItem[];
  flags: Record<string, boolean | number | string>;
  ending: GameEndingState | null;
  debugWarnings: string[];
};
```

- [ ] **Step 3: Create initial world**

Create `src/core/data/initialWorld.ts`. Use the initial values from the spec and set `metrics.turn` to `1`, `currentEventId` to `lv_bu_surrenders`, `ending` to `null`, and `debugWarnings` to `[]`. The character roster must include all seven `CharacterId` keys.

Important values:

```ts
metrics: {
  turn: 1,
  internalStability: 65,
  yuanShaoPressure: 50,
  oldGuardPressure: 20,
  surrenderedFactionRisk: 45,
  militaryReadiness: 55,
  rulerPrestige: 70,
  rumorLevel: 15,
}

luBuArc: {
  betrayalRisk: 52,
  defectionIntent: 20,
  rebellionIntent: 10,
  integrationProgress: 15,
  militaryDependence: 10,
  chenGongInfluence: 45,
  yuanShaoContact: 0,
}
```

Set starting character highlights:

- 吕布: trust `25`, grievance `12`, ambition `88`, pride `85`, insecurity `55`, belonging `20`, armyControl `3000`.
- 夏侯惇: trust `82`, grievance `8`, pride `80`, armyControl `25000`.
- 张辽: trust `40`, belonging `35`, insecurity `35`, armyControl `2000`.
- 陈宫: loyalty `25`, trust `18`, grievance `40`, belonging `10`.

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit domain types**

```bash
git add src/core/types src/core/data/initialWorld.ts
git commit -m "feat: add world domain model"
```

---

## Task 3: Engines and Unit Tests

**Files:**
- Create: `src/core/engine/pathUtils.ts`
- Create: `src/core/engine/effectEngine.ts`
- Create: `src/core/engine/conditionEngine.ts`
- Create: `src/core/engine/riskEngine.ts`
- Create: `src/core/engine/directorEngine.ts`
- Create: `src/core/engine/npcEngine.ts`
- Create: `src/core/engine/reportEngine.ts`
- Create: `src/core/engine/endingEngine.ts`
- Create: `src/core/data/endings.ts`
- Test: `src/core/engine/effectEngine.test.ts`
- Test: `src/core/engine/directorEngine.test.ts`
- Test: `src/core/engine/endingEngine.test.ts`

- [ ] **Step 1: Write effect engine tests**

Create `src/core/engine/effectEngine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { initialWorld } from "../data/initialWorld";
import { applyEffects } from "./effectEngine";

describe("effectEngine", () => {
  it("adds and clamps normal numeric paths", () => {
    const next = applyEffects(initialWorld, [
      { target: "metrics.internalStability", op: "+", value: 80 },
    ]);
    expect(next.metrics.internalStability).toBe(100);
  });

  it("does not clamp armyControl", () => {
    const next = applyEffects(initialWorld, [
      { target: "characters.lv_bu.armyControl", op: "+", value: 30000 },
    ]);
    expect(next.characters.lv_bu.armyControl).toBe(33000);
  });

  it("records a warning for missing paths", () => {
    const next = applyEffects(initialWorld, [
      { target: "metrics.missing", op: "+", value: 1 },
    ]);
    expect(next.debugWarnings[0]).toContain("metrics.missing");
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm test -- src/core/engine/effectEngine.test.ts
```

Expected: FAIL because `effectEngine` does not exist yet.

- [ ] **Step 3: Implement path and effect engines**

Create `src/core/engine/pathUtils.ts`:

```ts
export function getValueByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

export function hasPath(obj: unknown, path: string): boolean {
  const keys = path.split(".");
  let cursor = obj;

  for (const key of keys) {
    if (cursor === null || typeof cursor !== "object" || !(key in cursor)) {
      return false;
    }
    cursor = (cursor as Record<string, unknown>)[key];
  }

  return true;
}

export function setValueByPath(obj: unknown, path: string, value: unknown) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  if (!lastKey) return;

  let cursor = obj as Record<string, unknown>;
  for (const key of keys) {
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[lastKey] = value;
}
```

Create `src/core/engine/effectEngine.ts`:

```ts
import type { Effect } from "../types/effect";
import type { WorldState } from "../types/world";
import { getValueByPath, hasPath, setValueByPath } from "./pathUtils";

const UNCLAMPED_TARGETS = ["armyControl", "turn"];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function shouldClamp(target: string) {
  return !UNCLAMPED_TARGETS.some((segment) => target.endsWith(segment));
}

export function applyEffect(world: WorldState, effect: Effect): WorldState {
  const next = structuredClone(world);

  if (!hasPath(next, effect.target)) {
    next.debugWarnings.push(`Effect target not found: ${effect.target}`);
    return next;
  }

  const current = getValueByPath(next, effect.target);

  if (effect.op === "set") {
    setValueByPath(next, effect.target, effect.value);
    return next;
  }

  if (typeof current !== "number" || typeof effect.value !== "number") {
    next.debugWarnings.push(`Effect target is not numeric: ${effect.target}`);
    return next;
  }

  const rawValue = effect.op === "+" ? current + effect.value : current - effect.value;
  setValueByPath(next, effect.target, shouldClamp(effect.target) ? clamp(rawValue) : rawValue);
  return next;
}

export function applyEffects(world: WorldState, effects: Effect[]): WorldState {
  return effects.reduce((acc, effect) => applyEffect(acc, effect), world);
}
```

- [ ] **Step 4: Verify effect engine**

Run:

```bash
npm test -- src/core/engine/effectEngine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Implement condition, risk, report, NPC engines**

Create `src/core/engine/conditionEngine.ts` with alias mapping from the spec:

```ts
import type { WorldState } from "../types/world";

export function getConditionContext(world: WorldState) {
  return {
    turn: world.metrics.turn,
    oldGuardPressure: world.metrics.oldGuardPressure,
    yuanShaoPressure: world.metrics.yuanShaoPressure,
    internalStability: world.metrics.internalStability,
    surrenderedFactionRisk: world.metrics.surrenderedFactionRisk,
    betrayalRisk: world.luBuArc.betrayalRisk,
    chenGongInfluence: world.luBuArc.chenGongInfluence,
    yuanShaoContact: world.luBuArc.yuanShaoContact,
    integrationProgress: world.luBuArc.integrationProgress,
    militaryDependence: world.luBuArc.militaryDependence,
    xiahouGrievance: world.characters.xiahou_dun.mentalState.grievance,
    luBuGrievance: world.characters.lv_bu.mentalState.grievance,
    luBuArmyControl: world.characters.lv_bu.armyControl,
    luBuStatus: world.characters.lv_bu.status,
    zhangLiaoBelonging: world.characters.zhang_liao.mentalState.belonging,
    zhangLiaoTrust: world.characters.zhang_liao.mentalState.trust,
  };
}

export function checkCondition(world: WorldState, condition?: string) {
  if (!condition) return true;
  const context = getConditionContext(world);
  const keys = Object.keys(context);
  const values = Object.values(context);

  try {
    return Boolean(Function(...keys, `return ${condition};`)(...values));
  } catch {
    world.debugWarnings.push(`Condition failed to parse: ${condition}`);
    return false;
  }
}
```

Create `src/core/engine/riskEngine.ts`, `npcEngine.ts`, and `reportEngine.ts` using the formulas and labels from the spec. Keep all functions pure and return a cloned `WorldState`.

Minimum required exports:

```ts
export function recalculateLuBuRisk(world: WorldState): WorldState;
export function getRiskLabel(value: number): "暂可控" | "心意未定" | "风险渐显" | "祸心暗伏";
export function runNpcDecisions(world: WorldState): WorldState;
export function generateTurnReport(world: WorldState): string;
```

- [ ] **Step 6: Implement endings and ending tests**

Create `src/core/data/endings.ts` with all 8 IDs from the spec. Create `src/core/engine/endingEngine.ts` with:

```ts
export function checkEarlyEnding(world: WorldState): GameEndingState | null;
export function checkFinalEnding(world: WorldState): GameEndingState;
export function getEnding(id: EndingId): Ending;
```

Create `src/core/engine/endingEngine.test.ts` with one test per ending ID. Each test should clone `initialWorld`, set only the required fields for that ending, and assert the returned ID.

Run:

```bash
npm test -- src/core/engine/endingEngine.test.ts
```

Expected: PASS for all 8 endings.

- [ ] **Step 7: Implement Director and tests**

Create `src/core/engine/directorEngine.ts` with:

```ts
export function pickNextEvent(world: WorldState, events = storyEvents): StoryEvent | null;
```

Rules:

- Exclude resolved events.
- Honor `turnRange`.
- Honor `condition`.
- At turn 9, check final probe order: treason, old guard crisis, integrated, wavering.
- If no candidates match, fallback to next unresolved mainline event.

Create `src/core/engine/directorEngine.test.ts` covering priority, no repeats, turn 9 fallback, and condition filtering.

- [ ] **Step 8: Run all engine tests**

Run:

```bash
npm test
npm run typecheck
```

Expected: PASS.

- [ ] **Step 9: Commit engines**

```bash
git add src/core/engine src/core/data/endings.ts
git commit -m "feat: add simulation engines"
```

---

## Task 4: Story Events Data

**Files:**
- Create: `src/core/data/events.ts`
- Modify: `src/core/engine/directorEngine.test.ts`

- [ ] **Step 1: Create all event records**

Create `src/core/data/events.ts` exporting `storyEvents: StoryEvent[]`.

Must include these 12 event IDs:

```text
lv_bu_surrenders
lv_bu_title_debate
lv_bu_requests_army
old_guard_unrest
yuan_shao_secret_envoy
frontline_crisis
battle_credit_dispute
chen_gong_night_talk
final_probe_integrated
final_probe_wavering
final_probe_treason
final_probe_old_guard_crisis
```

Each non-final event has exactly 4 choices. Each final-probe event has exactly 4 choices.

- [ ] **Step 2: Implement event 1 and event 2 with exact choice IDs**

Add `lv_bu_surrenders` choices:

```text
accept_generously
accept_as_guest_general
reject_lubu_keep_zhangliao
detain_lubu_absorb_troops
```

Add `lv_bu_title_debate` choices:

```text
grant_title
give_money_no_title
join_council_no_power
delay_rewards
```

Use the original brief effects for these choices where available. For any missing exact number, choose balanced values consistent with the mechanical direction:

- small effect: 3-6
- medium effect: 8-12
- large effect: 15-25
- severe effect: 30+

- [ ] **Step 3: Implement events 3-5 with exact choice IDs**

Add `lv_bu_requests_army`, `old_guard_unrest`, and `yuan_shao_secret_envoy`.

Choice IDs must match the spec matrix. Each choice must include:

- `label`
- `description`
- `tags`
- `report`
- `effects`

Special flags:

- `appease_xiahou_promise_attack` sets `flags.promise_xiahou_attack` to `true`.
- `investigate_secretly` increments `flags.yuan_shao_contact_evidence` by setting an initial numeric value through `set` if needed in the store fallback or using an existing `0` initialized flag.
- `counterplot_envoy` sets `flags.trap_yuan_vanguard` to `true`.

- [ ] **Step 4: Implement events 6-8**

Add `frontline_crisis`, `battle_credit_dispute`, and `chen_gong_night_talk`.

Special flags:

- `frontline_crisis` choices should meaningfully reduce `metrics.yuanShaoPressure` except `old_guard_only`, which reduces less.
- `zhangliao_independent_merit` and `convert_zhangliao_privately` must raise Zhang Liao trust and belonging.
- `imprison_chen_gong` must set `characters.chen_gong.status` to `imprisoned`.

- [ ] **Step 5: Implement final probe events**

Add all four turn 9 final probe events. Each has exactly 4 choices. Effects should push the world toward the ending implied by the choice:

- disarmament and rebalance choices reduce `betrayalRisk` and `oldGuardPressure`.
- overuse choices increase `militaryDependence`.
- harsh arrest or raid choices set吕布 or陈宫 status flags and reduce stability.
- Zhang Liao persuasion choices increase `zhangLiaoBelonging` and reduce `luBuArmyControl` or `yuanShaoContact`.

- [ ] **Step 6: Add event-data tests to Director tests**

Extend `directorEngine.test.ts`:

```ts
it("contains the required event ids", () => {
  const ids = new Set(storyEvents.map((event) => event.id));
  expect(ids).toEqual(new Set([
    "lv_bu_surrenders",
    "lv_bu_title_debate",
    "lv_bu_requests_army",
    "old_guard_unrest",
    "yuan_shao_secret_envoy",
    "frontline_crisis",
    "battle_credit_dispute",
    "chen_gong_night_talk",
    "final_probe_integrated",
    "final_probe_wavering",
    "final_probe_treason",
    "final_probe_old_guard_crisis",
  ]));
});

it("all events expose four choices", () => {
  for (const event of storyEvents) {
    expect(event.choices).toHaveLength(4);
  }
});
```

- [ ] **Step 7: Verify event data**

Run:

```bash
npm test -- src/core/engine/directorEngine.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit events**

```bash
git add src/core/data/events.ts src/core/engine/directorEngine.test.ts
git commit -m "feat: add lu bu story events"
```

---

## Task 5: Zustand Store Game Loop

**Files:**
- Create: `src/store/worldStore.ts`
- Test: `src/store/worldStore.test.ts`

- [ ] **Step 1: Write store tests**

Create `src/store/worldStore.test.ts`:

```ts
import { describe, expect, it, beforeEach } from "vitest";
import { useWorldStore } from "./worldStore";

describe("worldStore", () => {
  beforeEach(() => {
    useWorldStore.getState().reset();
  });

  it("applies a choice, records chronicle, and advances to turn 2", () => {
    useWorldStore.getState().choose("accept_generously");
    const world = useWorldStore.getState().world;
    expect(world.metrics.turn).toBe(2);
    expect(world.resolvedEventIds).toContain("lv_bu_surrenders");
    expect(world.chronicle.some((item) => item.type === "choice")).toBe(true);
  });

  it("ignores an invalid choice and records a warning", () => {
    useWorldStore.getState().choose("missing_choice");
    const world = useWorldStore.getState().world;
    expect(world.metrics.turn).toBe(1);
    expect(world.debugWarnings.at(-1)).toContain("missing_choice");
  });
});
```

- [ ] **Step 2: Run failing store tests**

Run:

```bash
npm test -- src/store/worldStore.test.ts
```

Expected: FAIL because store does not exist.

- [ ] **Step 3: Implement store**

Create `src/store/worldStore.ts`:

```ts
import { create } from "zustand";
import { initialWorld } from "@/core/data/initialWorld";
import { storyEvents } from "@/core/data/events";
import { applyEffects } from "@/core/engine/effectEngine";
import { checkEarlyEnding, checkFinalEnding } from "@/core/engine/endingEngine";
import { pickNextEvent } from "@/core/engine/directorEngine";
import { recalculateLuBuRisk } from "@/core/engine/riskEngine";
import { runNpcDecisions } from "@/core/engine/npcEngine";
import { generateTurnReport } from "@/core/engine/reportEngine";
import type { WorldState } from "@/core/types/world";

type WorldStore = {
  world: WorldState;
  choose: (choiceId: string) => void;
  reset: () => void;
};

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  world: structuredClone(initialWorld),

  choose: (choiceId: string) => {
    const world = get().world;
    if (world.ending) return;

    const currentEvent = storyEvents.find((event) => event.id === world.currentEventId);
    if (!currentEvent) {
      const next = structuredClone(world);
      next.debugWarnings.push(`Current event not found: ${world.currentEventId}`);
      set({ world: next });
      return;
    }

    const choice = currentEvent.choices.find((item) => item.id === choiceId);
    if (!choice) {
      const next = structuredClone(world);
      next.debugWarnings.push(`Choice not found: ${choiceId}`);
      set({ world: next });
      return;
    }

    let next = applyEffects(world, choice.effects);
    next.resolvedEventIds.push(currentEvent.id);
    next.chronicle.push({
      id: makeId("choice"),
      turn: next.metrics.turn,
      title: `决策：${choice.label}`,
      content: choice.report,
      type: "choice",
    });

    next = recalculateLuBuRisk(next);
    next = runNpcDecisions(next);
    next.chronicle.push({
      id: makeId("report"),
      turn: next.metrics.turn,
      title: "回合奏报",
      content: generateTurnReport(next),
      type: "report",
    });

    const earlyEnding = checkEarlyEnding(next);
    if (earlyEnding) {
      next.ending = earlyEnding;
      next.currentEventId = "ending";
      set({ world: next });
      return;
    }

    next.metrics.turn += 1;

    if (next.metrics.turn >= 10) {
      next.ending = checkFinalEnding(next);
      next.currentEventId = "ending";
      set({ world: next });
      return;
    }

    const nextEvent = pickNextEvent(next);
    next.currentEventId = nextEvent?.id ?? "ending";
    set({ world: next });
  },

  reset: () => {
    set({ world: structuredClone(initialWorld) });
  },
}));
```

- [ ] **Step 4: Verify store**

Run:

```bash
npm test -- src/store/worldStore.test.ts
npm test
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit store**

```bash
git add src/store src/store/worldStore.test.ts
git commit -m "feat: add game loop store"
```

---

## Task 6: shadcn-Compatible UI Primitives

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/components/ui/alert.tsx`
- Create: `src/components/ui/collapsible.tsx`

- [ ] **Step 1: Create UI primitives**

Use shadcn/ui component shape. Components must use `cn()` and semantic Tailwind tokens. Minimum required exports:

```ts
// button.tsx
export { Button, buttonVariants };

// card.tsx
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

// badge.tsx
export { Badge, badgeVariants };

// separator.tsx
export { Separator };

// alert.tsx
export { Alert, AlertTitle, AlertDescription };

// collapsible.tsx
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```

- [ ] **Step 2: Verify primitives compile**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit UI primitives**

```bash
git add src/components/ui
git commit -m "feat: add ui primitives"
```

---

## Task 7: War Dossier Panels and Responsive App Shell

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/HeaderBar.tsx`
- Create: `src/components/panels/DashboardPanel.tsx`
- Create: `src/components/panels/CharacterPanel.tsx`
- Create: `src/components/panels/EventPanel.tsx`
- Create: `src/components/panels/ChroniclePanel.tsx`
- Create: `src/components/panels/EndingPanel.tsx`
- Create: `src/components/panels/DebugPanel.tsx`
- Create: `src/components/game/MetricCard.tsx`
- Create: `src/components/game/CharacterCard.tsx`
- Create: `src/components/game/DecisionButton.tsx`
- Create: `src/components/game/StatusBadge.tsx`

- [ ] **Step 1: Implement visual helpers**

Create `StatusBadge`, `MetricCard`, `CharacterCard`, and `DecisionButton`.

Rules:

- No exact hidden effects in choice buttons.
- Use Badges for tags.
- Use mono font for numeric values.
- No progress bars with filled tracks.
- No em dash or en dash in visible UI strings.

- [ ] **Step 2: Implement panels**

Implement panels with these responsibilities:

- `DashboardPanel`: 8 metrics, 4-column desktop, 2-column tablet, 1-2 mobile.
- `CharacterPanel`: 5 cards,吕布 card visually emphasized and can span 2 columns on desktop.
- `EventPanel`: event title, theme, description, 4 decisions, disabled while choosing.
- `ChroniclePanel`: latest entries first, badge per item type.
- `EndingPanel`: ending title, description, evaluation, final metrics, reset.
- `DebugPanel`: collapsible JSON, default closed.

- [ ] **Step 3: Implement AppShell**

Create desktop and mobile layout exactly from the spec:

- Desktop: header sticky, two columns, right decision column `lg:w-[440px] xl:w-[480px]`, sticky event panel.
- Mobile: single column with event/ending before dashboard.
- No nested cards inside cards.

- [ ] **Step 4: Replace smoke App**

`src/App.tsx` should only render:

```tsx
import { AppShell } from "@/components/layout/AppShell";

export default function App() {
  return <AppShell />;
}
```

- [ ] **Step 5: Verify UI compiles**

Run:

```bash
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit UI panels**

```bash
git add src/App.tsx src/components
git commit -m "feat: add war dossier interface"
```

---

## Task 8: End-to-End Playability and Polish

**Files:**
- Modify: `src/core/data/events.ts`
- Modify: `src/core/engine/reportEngine.ts`
- Modify: `src/components/panels/*`
- Modify: `README.md`

- [ ] **Step 1: Play through manually in dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Open the printed localhost URL.

Manual checks:

- Turn 1 starts at `吕布来投`.
- Each decision advances the game.
- Turn 9 shows one final-probe branch.
- After resolving turn 9, turn 10 shows ending panel.
- Early failure, if triggered, stops immediately without incrementing turn.

- [ ] **Step 2: Tune content if routes are blocked**

If a route cannot reach turn 10 because Director has no event, adjust `turnRange`, `priority`, or fallback logic. Do not add new events.

- [ ] **Step 3: Responsive visual check**

Use browser responsive tools:

- Desktop: `1440x900`
- Tablet: `900x900`
- Mobile: `390x844`

Check:

- No text overlap.
- Event panel appears before dashboard on mobile.
- Buttons are at least `44px` tall.
- Decision labels do not wrap awkwardly on desktop.
- Debug panel is collapsed by default.

- [ ] **Step 4: Run final commands**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all pass.

- [ ] **Step 5: Update README**

Write README with:

```md
# 乱世人心：吕布来投

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## Content Model

Events live in `src/core/data/events.ts`.
Endings live in `src/core/data/endings.ts`.
The UI submits only `choiceId`; engines mutate `WorldState`.
```
```

- [ ] **Step 6: Commit polish**

```bash
git add README.md src
git commit -m "chore: verify playable demo"
```

---

## Self-Review Checklist

- [ ] Spec coverage: all sections in `2026-06-14-lu-bu-demo-design.md` map to tasks above.
- [ ] No route has fewer than 4 choices.
- [ ] All 8 endings have tests.
- [ ] `initialWorld.metrics.turn` is exactly `1`.
- [ ] Early failure sets `ending` and does not increment turn.
- [ ] UI uses Tailwind CSS + shadcn-compatible primitives.
- [ ] Desktop and mobile responsive layouts are implemented.
- [ ] War Dossier visual tokens are in `src/index.css`.
- [ ] `npm run typecheck`, `npm test`, and `npm run build` pass.
