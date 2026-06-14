# 乱世人心：吕布来投

10 回合前端策略叙事原型。玩家作为曹操，在袁绍压力、曹营旧臣不满、降将风险和吕布不稳定心理之间做决策。

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
