# 乱世人心：吕布来投

一个纯前端的历史人物策略叙事原型。

GitHub: <https://github.com/501981732/luanshi-renxin-lubu-demo>

玩家扮演曹操，在 9 个决策回合内处理吕布来投后的军政危机。第 10 回合根据吕布风险、袁绍压力、内部稳定、老将不满和张辽归属等状态进入不同结局。

## Demo 目标

这个原型不是完整三国游戏，而是一个“人心沙盘”：

- 吕布不是一张武将卡，而是有欲望、怨气、恐惧、野心和兵权的变量集合。
- 夏侯惇代表曹营旧臣压力。
- 张辽代表可被转化的战略人才。
- 陈宫代表吕布阵营中的谋士影响。
- 袁绍压力让玩家不能只做内部管理。

核心问题是：

> 你能不能在不完全信任吕布的情况下，仍然用好他？

## 功能

- 9 个可操作决策回合
- 第 10 回合自动结局判定
- 12 个故事事件，每个事件 4 个选项
- 8 个结局
- 人物心理和全局局势数值模拟
- NPC 自动行动
- 军中纪事和奏报
- Debug WorldState 面板
- 响应式 War Dossier UI

## 技术栈

- Vite
- React
- TypeScript
- Zustand
- Tailwind CSS
- shadcn/ui 风格组件
- Vitest
- Testing Library

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址：

```text
http://127.0.0.1:5173/
```

## 验证

```bash
npm run typecheck
npm test
npm run build
```

当前测试覆盖：

- EffectEngine
- DirectorEngine
- EndingEngine
- Zustand game loop

## 项目结构

```text
src/
  core/
    types/      # 世界、人物、事件、效果、结局类型
    data/       # 初始世界、事件数据、结局数据
    engine/     # 纯规则引擎
  store/        # Zustand game loop
  components/
    ui/         # shadcn 风格基础组件
    game/       # 游戏专用小组件
    layout/     # 应用布局
    panels/     # 主面板
```

## 内容模型

事件数据在：

```text
src/core/data/events.ts
```

结局数据在：

```text
src/core/data/endings.ts
```

UI 只提交 `choiceId`。状态修改由规则引擎完成：

```text
choiceId
  -> effects
  -> risk engine
  -> npc engine
  -> report engine
  -> director / ending engine
```

## 设计方向

视觉语言是 `War Dossier`：

- 军帐案牍
- 战略沙盘
- 冷灰纸面
- 墨色文字
- 青玉主色
- 琥珀警戒
- 克制风险红

刻意避免：

- 通用后台模板
- 三国手游武将卡
- 仿古卷轴
- 书法字体
- AI 紫蓝渐变

## 开源协议

MIT License
