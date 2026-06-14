# 《乱世人心：吕布来投》10 回合 Demo 设计

## 1. 背景与目标

本项目初始化为一个纯前端策略叙事原型。玩家扮演曹操，在 10 回合内处理吕布来投带来的外部战事、内部旧臣压力、降将风险和人物心理变化。

第一版目标不是完整三国游戏，而是跑通一个可点击、可推演、可调试的“人心沙盘”闭环：

```text
展示当前事件
→ 玩家选择决策
→ 系统修改人物心理 / 全局状态
→ NPC 自动推进
→ 生成奏报和纪事
→ 触发新事件
→ 第 10 回合判定结局
```

成功标准：

- 10 回合可完整玩到结局。
- 玩家能看到全局局势、人物状态、事件选择、军中纪事和调试状态。
- 吕布、夏侯惇、张辽、陈宫等关键人物的状态变化会影响后续事件和结局。
- 事件、选项、效果、结局以数据驱动方式组织，便于后续扩展。

## 2. 技术与边界

技术栈：

- Vite
- React
- TypeScript
- Zustand
- Tailwind CSS
- shadcn/ui
- Vitest

第一版不包含：

- 后端服务
- 账号系统
- LLM 奏报生成
- 在线存档
- 美术资产管线
- 完整商业化 UI

代码边界：

```text
src/
  core/
    types/      # Character, WorldState, Event, Effect, Ending 等类型
    data/       # initialWorld, storyEvents, endings
    engine/     # effect, risk, director, npc, report, ending
  store/        # Zustand store
  pages/        # 页面级 UI
  components/   # 可复用组件
```

核心原则：

- UI 不直接修改 `WorldState`，只提交 `choiceId`。
- 引擎负责状态修改、回合推进、事件选择、奏报和结局判定。
- 事件数据与引擎逻辑分离。
- 开发阶段保留 Debug 面板，展示完整状态。

## 3. 核心数据模型

### 3.1 WorldState

`WorldState` 是唯一游戏状态源，包含：

- `metrics`：全局局势。
- `characters`：人物状态。
- `luBuArc`：吕布隐藏弧线。
- `currentEventId`：当前事件。
- `resolvedEventIds`：已解决事件。
- `promises`：承诺债务。
- `chronicle`：军中纪事。
- `flags`：分支和临时标记。
- `ending`：已触发结局，若无则为空。
- `debugWarnings`：调试警告。

### 3.2 WorldMetrics

全局指标：

- `turn`
- `internalStability`
- `yuanShaoPressure`
- `oldGuardPressure`
- `surrenderedFactionRisk`
- `militaryReadiness`
- `rulerPrestige`
- `rumorLevel`

除 `turn` 外，常规指标范围为 `0-100`。

### 3.3 Character

关键人物包括：

- 曹操
- 吕布
- 荀彧
- 夏侯惇
- 张辽
- 陈宫
- 袁绍使者

每个人物包含：

- 基础属性：`stats`
- 性格标签：`traits`
- 心理状态：`mentalState`
- 关系：`relationships`
- 兵权：`armyControl`
- 身份：`titles`
- 状态：`active | imprisoned | executed | defected`

`armyControl` 不按 `0-100` 夹断。

### 3.4 LuBuArcState

吕布专属隐藏弧线：

- `betrayalRisk`
- `defectionIntent`
- `rebellionIntent`
- `integrationProgress`
- `militaryDependence`
- `chenGongInfluence`
- `yuanShaoContact`

前台不直接显示全部隐藏值。常规 UI 将 `betrayalRisk` 显示为：

- `0-29`：暂可控
- `30-54`：心意未定
- `55-74`：风险渐显
- `75-100`：祸心暗伏

## 4. 事件与效果系统

事件结构：

```ts
type StoryEvent = {
  id: string;
  title: string;
  description: string;
  turnRange?: [number, number];
  priority: number;
  condition?: string;
  choices: EventChoice[];
};
```

选项结构：

```ts
type EventChoice = {
  id: string;
  label: string;
  description: string;
  tags: ChoiceTag[];
  effects: Effect[];
  report: string;
};
```

效果结构：

```ts
type Effect = {
  target: string;
  op: "+" | "-" | "set";
  value: number | string | boolean;
};
```

效果使用路径式目标：

```ts
{ target: "characters.lv_bu.mentalState.trust", op: "+", value: 12 }
```

规则：

- 数值效果默认夹断到 `0-100`。
- `armyControl`、`turn` 等可配置为不夹断。
- 路径不存在时跳过，并记录 `debugWarnings`。
- `set` 可写入字符串、布尔或数字。

## 5. 回合流程

回合语义：本 Demo 包含 9 个可操作决策回合，第 10 回合为结局展示与评价。玩家解决第 9 回合事件后，系统推进到第 10 回合并立即执行结局判定。

每次玩家选择后执行：

```text
1. 找到当前事件与选项
2. 应用选项 effects
3. 记录玩家决策到 chronicle
4. 重算吕布风险
5. 执行 NPC 自动行动
6. 生成回合奏报
7. 检查提前失败结局
8. 回合 +1
9. 如果当前回合为第 10 回合，判定结局
10. 否则由 Director 选择下一事件
```

提前失败语义：如果第 7 步触发提前失败结局，系统立即写入 `ending`，将 `currentEventId` 置为 `ending`，停止本次流程；不执行回合 +1，不调用 Director，也不再展示普通事件。

如果没有可用事件且未结局，Director 使用主线 fallback，选择下一个未解决的主线事件。

## 6. Engine 设计

### 6.1 EffectEngine

职责：

- 根据 `Effect[]` 修改 `WorldState`。
- 支持 `+`、`-`、`set`。
- 处理路径读取与写入。
- 处理 clamp 和调试警告。

### 6.2 RiskEngine

职责：

- 根据吕布心理、性格、兵权、陈宫影响、袁绍接触、融入程度重算 `betrayalRisk`。
- 在高风险条件下推进 `defectionIntent` 和 `rebellionIntent`。
- 提供 `getRiskLabel()` 给 UI 和奏报使用。

### 6.3 DirectorEngine

职责：

- 从 `storyEvents` 中挑选下一事件。
- 排除已解决事件。
- 检查 `turnRange`、`condition`、`priority`。
- 第 9 回合根据状态进入对应分支事件。
- 提供主线 fallback，保证 Demo 可完成。

第一版可用受控表达式环境解析 `condition`，正式扩展时可替换成安全 DSL 或表达式库。表达式上下文使用扁平变量名，例如：

```ts
condition: "oldGuardPressure >= 60 && betrayalRisk >= 55"
```

条件表达式至少暴露以下别名：

| 别名 | WorldState 路径 |
| --- | --- |
| `turn` | `metrics.turn` |
| `oldGuardPressure` | `metrics.oldGuardPressure` |
| `yuanShaoPressure` | `metrics.yuanShaoPressure` |
| `internalStability` | `metrics.internalStability` |
| `surrenderedFactionRisk` | `metrics.surrenderedFactionRisk` |
| `betrayalRisk` | `luBuArc.betrayalRisk` |
| `chenGongInfluence` | `luBuArc.chenGongInfluence` |
| `yuanShaoContact` | `luBuArc.yuanShaoContact` |
| `integrationProgress` | `luBuArc.integrationProgress` |
| `militaryDependence` | `luBuArc.militaryDependence` |
| `xiahouGrievance` | `characters.xiahou_dun.mentalState.grievance` |
| `luBuGrievance` | `characters.lv_bu.mentalState.grievance` |
| `luBuArmyControl` | `characters.lv_bu.armyControl` |
| `luBuStatus` | `characters.lv_bu.status` |
| `zhangLiaoBelonging` | `characters.zhang_liao.mentalState.belonging` |
| `zhangLiaoTrust` | `characters.zhang_liao.mentalState.trust` |

### 6.4 NpcEngine

职责：

- 回合结算时推进关键 NPC 行为。
- 吕布在高怨气、高风险、高兵权时可能增加陈宫影响、袁绍接触或起兵意图。
- 荀彧在风险升高时给出进谏。
- 夏侯惇在怨气升高时推高老将压力。
- 张辽在归属感升高时更倾向曹营。
- 陈宫在吕布不安或怨气高时扩大影响。

NPC 行为会写入 `chronicle`。

### 6.5 ReportEngine

职责：

- 将状态摘要转换为玩家可读奏报。
- 第一版使用规则文本，不接 LLM。
- 奏报避免直接暴露全部隐藏数值，但 Debug 面板可见。

### 6.6 EndingEngine

职责：

- 检查提前失败结局。
- 第 10 回合按优先级判定结局。
- 返回结局名称、描述、评价和关键指标。
- 提前失败一旦触发即中止后续回合推进和事件选择。

## 7. 10 回合内容范围

第一版落地完整 10 回合主线，复杂隐藏副作用先实现关键项。第 1-9 回合是玩家决策事件，第 10 回合是结局展示，不再提供普通事件选择。

事件范围：

1. 吕布来投，4 个选项。
2. 曹营议吕布，4 个选项。
3. 吕布请兵，4 个选项。
4. 老将不服，4 个选项，可由压力提前或延后触发。
5. 袁绍密使，4 个选项，可由风险、兵权、怨气触发。
6. 前线告急，4 个选项。
7. 战功归属，4 个选项。
8. 陈宫夜劝，4 个选项，可由陈宫影响、吕布怨气、背叛风险触发。
9. 最终试探，根据状态进入 4 个分支之一：
   - 吕布归心路线
   - 吕布摇摆路线
   - 吕布暗叛路线
   - 老将危机路线
10. 结局判定。

### 7.1 事件内容矩阵

实现必须落地以下事件 ID、选项 ID 和主要机械方向。具体数值由实现阶段在这些机械方向内调优，但每个选项必须至少影响 2 类状态：人物心理、全局指标、吕布弧线、旗标或承诺。

| 回合 | 事件 ID | 触发 / fallback | 选项 ID | 主要机械方向 |
| --- | --- | --- | --- | --- |
| 1 | `lv_bu_surrenders` | 固定开局 | `accept_generously` / `accept_as_guest_general` / `reject_lubu_keep_zhangliao` / `detain_lubu_absorb_troops` | 厚纳提高吕布信任与老将压力；客将提高稳定但增加吕布不安；拒吕保守但推高吕布投敌；软禁降低短期兵权但推高陈宫敌意和降将风险。 |
| 2 | `lv_bu_title_debate` | `turn >= 2` | `grant_title` / `give_money_no_title` / `join_council_no_power` / `delay_rewards` | 封将安吕布但刺激旧臣；赐财小幅安抚但伤自尊；入军议提高融入；暂不封赏稳旧臣但增强陈宫影响。 |
| 3 | `lv_bu_requests_army` | `turn >= 3` | `grant_30000` / `grant_8000_with_xiahou` / `xiahou_main_lubu_deputy` / `deny_army_request` | 三万独征强军但高风险；八千监军稳健；夏侯主将稳旧臣但伤吕布；拒兵降低军事准备并推高陈宫影响。 |
| 4 | `old_guard_unrest` | `oldGuardPressure > 35 || xiahouGrievance > 30 || luBuArmyControl > 10000`，否则主线 fallback | `appease_xiahou_promise_attack` / `praise_lubu_suppress_old_guard` / `dual_command_balance` / `secretly_monitor_lubu` | 安抚夏侯生成承诺；抬吕压旧提升吕布但恶化旧臣；双将制衡提升稳定；秘密监视降风险但增加谣言和被发现旗标风险。 |
| 5 | `yuan_shao_secret_envoy` | `betrayalRisk > 50 || luBuArmyControl > 10000 || luBuGrievance > 35`，否则主线 fallback | `search_lubu_camp` / `investigate_secretly` / `private_talk_lubu` / `counterplot_envoy` | 搜营切断袁绍接触但伤信任；暗查增加证据旗标；私谈降风险但生成重赏承诺；将计就计启用陷阱旗标，低信任时增加袁绍接触。 |
| 6 | `frontline_crisis` | `turn >= 6` | `trust_lubu_main_force` / `lubu_vanguard_xiahou_support` / `old_guard_only` / `zhangliao_independent_merit` | 吕布主力大降袁绍压力但增军事依赖；先锋压阵为稳健中线；只用老将稳旧臣但伤吕布；张辽立功推动张辽归曹但刺激吕布不安。 |
| 7 | `battle_credit_dispute` | 第 6 回合发生后 | `credit_lubu_first` / `credit_xiahou_first` / `split_credit_three_way` / `delay_rewards_after_battle` | 首功吕布刺激旧臣；首功夏侯刺激吕布风险；三方分功提升稳定和张辽归属；暂不封赏增加谣言且多方不满。 |
| 8 | `chen_gong_night_talk` | `chenGongInfluence > 55 || luBuGrievance > 45 || betrayalRisk > 65`，否则主线 fallback | `imprison_chen_gong` / `transfer_chen_gong_idle_post` / `bring_chen_gong_to_council` / `convert_zhangliao_privately` | 处置陈宫降其影响但伤吕布信任；调离稳健降风险；重用陈宫高风险怀柔；转化张辽提升张辽归曹并降低吕布支点。 |
| 9A | `final_probe_integrated` | `betrayalRisk < 45 && integrationProgress > 50 && zhangLiaoBelonging > 60` | `accept_partial_disarmament` / `keep_lubu_main_force` / `strip_lubu_power` / `make_zhangliao_independent_commander` | 归心路线：处理吕布主动交兵与张辽独立，决定稳定归附、未来隐患或反弹。 |
| 9B | `final_probe_wavering` | `betrayalRisk >= 45 && betrayalRisk < 75` | `fulfill_reward_promise` / `reduce_power_to_center` / `send_zhangliao_to_persuade` / `trap_second_envoy` | 摇摆路线：厚赏、削权、张辽劝说或设局抓证，决定第 10 回合成功、隐患或失败。 |
| 9C | `final_probe_treason` | `betrayalRisk >= 75 || yuanShaoContact > 65` | `arrest_lubu_in_tent` / `xiahou_raid_lubu_camp` / `zhangliao_persuade_old_troops` / `feign_ignorance_cut_retreat` | 暗叛路线：军事或政治清算；成功取决于吕布恐惧、张辽归属、兵权和证据旗标。 |
| 9D | `final_probe_old_guard_crisis` | `oldGuardPressure > 75 || xiahouGrievance > 70` | `appease_old_guard_reduce_lubu` / `rebuke_xiahou` / `public_rebalance_commands` / `force_unity_under_yuan_pressure` | 老将危机：处理旧臣裂痕；不同选择在内部稳定、吕布风险和曹操威望之间交换。 |

第 9 回合分支选择规则：Director 按优先级检查 `final_probe_treason`、`final_probe_old_guard_crisis`、`final_probe_integrated`、`final_probe_wavering`。若都不满足，fallback 到 `final_probe_wavering`，保证第 9 回合一定有可玩事件。

第 10 回合支持至少 6 个结局：

- 猛虎入笼
- 以虎破敌
- 张辽归曹
- 吕布投袁
- 营中兵变
- 斩虎留患

### 7.2 结局阈值与优先级

结局判定按以下优先级执行。提前失败只检查失败类结局：`camp_rebellion`、`lubu_defects_to_yuan`、`killed_tiger_left_wound`。第 10 回合检查全部结局。

| 优先级 | 结局 ID | 名称 | 条件 |
| --- | --- | --- | --- |
| 1 | `camp_rebellion` | 营中兵变 | `rebellionIntent > 70 && luBuGrievance > 70 && luBuArmyControl > 15000` |
| 2 | `lubu_defects_to_yuan` | 吕布投袁 | `yuanShaoContact > 70 && betrayalRisk > 75 && luBuArmyControl > 10000` |
| 3 | `killed_tiger_left_wound` | 斩虎留患 | `(luBuStatus === "executed" || luBuStatus === "imprisoned") && internalStability < 45 && surrenderedFactionRisk > 60` |
| 4 | `tiger_in_cage` | 猛虎入笼 | `betrayalRisk < 40 && integrationProgress > 60 && internalStability > 50` |
| 5 | `zhangliao_joins_cao` | 张辽归曹 | `zhangLiaoBelonging > 70 && zhangLiaoTrust > 65` |
| 6 | `win_with_tiger` | 以虎破敌 | `yuanShaoPressure < 30 && militaryDependence > 60 && betrayalRisk >= 50 && betrayalRisk < 75` |
| 7 | `tense_success` | 勉强收局 | `internalStability > 45 && yuanShaoPressure < 75 && oldGuardPressure < 80 && luBuStatus === "active"` |
| 8 | `failed_balance` | 驭人失衡 | fallback |

Demo 成功条件用于结局评价和 UI 展示：吕布未叛逃、未起兵、未投袁；袁绍压力未突破临界；内部稳定大于 45；老将不满小于 75；张辽至少进入倾向曹营状态。

## 8. UI 设计

第一版 UI 是策略游戏工具台，不做营销页。UI 技术底座使用 Tailwind CSS + shadcn/ui：Tailwind 负责布局、响应式和主题 token，shadcn/ui 提供按钮、卡片、标签、滚动区域、分隔线、折叠面板等基础组件。业务组件在 shadcn 基础上封装，不引入额外 UI 框架。

### 8.1 页面结构

第一版只有一个主应用页面，不做多路由。页面由 `AppShell` 组织：

```text
AppShell
  HeaderBar
  MainWorkspace
    SituationColumn
      DashboardPanel
      CharacterPanel
      ChroniclePanel
      DebugPanel
    DecisionColumn
      EventPanel 或 EndingPanel
```

`HeaderBar` 在桌面端使用 sticky 顶部栏，在移动端使用静态顶部栏。它展示产品名、当前模式、回合进度和“重开一局”按钮。主体不使用嵌套卡片；页面区块直接落在背景上，只有指标、人物、事件、纪事条目等独立对象使用 Card。

### 8.2 桌面布局

`lg` 及以上使用左右分栏，适合长时间推演：

```text
┌────────────────────────────────────────────────────────────────────┐
│ HeaderBar: 乱世人心 · 第 N / 10 回合                 [重开一局]   │
├───────────────────────────────────────┬────────────────────────────┤
│ SituationColumn                         │ DecisionColumn             │
│ ┌───────────────────────────────────┐ │ ┌────────────────────────┐ │
│ │ DashboardPanel                     │ │ │ EventPanel              │ │
│ │ 8 个局势指标，2-4 列自适应         │ │ │ 回合、标题、事件描述     │ │
│ └───────────────────────────────────┘ │ │ 4 个决策按钮             │ │
│ ┌───────────────────────────────────┐ │ │ 风险提示 / 标签          │ │
│ │ CharacterPanel                     │ │ └────────────────────────┘ │
│ │ 吕布、夏侯惇、张辽、荀彧、陈宫      │ │                            │
│ └───────────────────────────────────┘ │                            │
│ ┌───────────────────────────────────┐ │                            │
│ │ ChroniclePanel                     │ │                            │
│ └───────────────────────────────────┘ │                            │
│ ┌───────────────────────────────────┐ │                            │
│ │ DebugPanel                         │ │                            │
│ └───────────────────────────────────┘ │                            │
└───────────────────────────────────────┴────────────────────────────┘
```

布局约束：

- `DecisionColumn` 宽度约 `420-480px`，在桌面端使用 sticky 顶部对齐，避免玩家滚动后找不到选择区。
- `SituationColumn` 使用最大宽度约束和网格布局，保持高信息密度但不拥挤。
- `ChroniclePanel` 是纵向时间流，最新记录在上方或下方均可，但必须一致。

### 8.3 移动布局

响应式布局：

- `lg` 及以上：使用左右分栏，右侧事件面板固定宽度，适合桌面推演。
- `md`：主区与事件区仍保持双栏，但指标卡和人物卡减少列数，避免拥挤。
- `sm` 及以下：改为单列，顺序为 `HeaderBar → EventPanel / EndingPanel → DashboardPanel → CharacterPanel → ChroniclePanel → DebugPanel`。
- Debug 面板默认折叠，移动端不占据主要阅读空间。
- 所有卡片、按钮、标签和长文本必须在移动端不溢出、不重叠。
- 移动端选项按钮全宽排列，每个按钮包含标题、说明和标签，点击目标高度不小于 `44px`。
- 移动端 Header 不固定，避免遮挡阅读；桌面端 Header 可 sticky。

### 8.4 核心组件设计

`DashboardPanel`：

- 展示 8 个全局指标。
- 每个 `MetricCard` 包含名称、数值、简短状态标签。
- 袁绍压力、老将压力、谣言强度等风险型指标数值越高越危险；内部稳定、军事准备、威望等收益型指标数值越高越好。颜色语义必须区分这两类。

`CharacterPanel`：

- 使用 5 张人物卡：吕布、夏侯惇、张辽、荀彧、陈宫。
- 吕布卡权重最高，展示风险标签、信任、怨气、兵权、融入程度的摘要。
- 夏侯惇卡突出旧臣怨气和信任。
- 张辽卡突出归属、信任、是否倾向曹营。
- 荀彧卡突出建议倾向，不需要展示过多数值。
- 陈宫卡突出影响力和敌意风险。

`EventPanel`：

- 顶部显示 `第 N 回合`、事件标题、事件主题短句。
- 中部显示事件描述，保持叙事感。
- 下方显示 4 个决策按钮；按钮不显示精确数值，只显示方向性标签，如 `军事`、`稳健`、`高风险`、`安抚旧臣`、`转化张辽`。
- 选项点击后禁用重复点击，直到 Zustand 状态更新完成。

`ChroniclePanel`：

- 展示决策、奏报、NPC 行动和 warning。
- 条目类型使用 Badge 区分：`决策`、`奏报`、`异动`、`警告`。
- 文本使用 `whitespace-pre-line` 支持奏报换行。

`EndingPanel`：

- 替代 `EventPanel` 出现在右侧或移动端顶部。
- 展示结局名、评价、关键达成/失败条件、最终指标摘要。
- 提供“重开一局”按钮。

`DebugPanel`：

- 使用折叠面板展示完整 JSON。
- 默认折叠；开发阶段保留，后续可通过环境变量隐藏。

### 8.5 shadcn/ui 组件映射

| 用途 | shadcn/ui 组件 |
| --- | --- |
| 页面卡片 | `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription` |
| 决策按钮 | `Button`，自定义 `variant` 或组合 `Card + button` |
| 标签 | `Badge` |
| 分隔 | `Separator` |
| Debug 折叠 | `Collapsible` 或 `Accordion` |
| 长纪事滚动 | `ScrollArea` |
| 结局/错误提示 | `Alert` |

### 8.6 视觉系统

设计读法：

- Reading this as: interactive strategy-simulation product UI for a player/designer testing an 人心沙盘, with a sober war-room dossier language, leaning toward shadcn/ui + Tailwind custom tokens rather than a generic dashboard.
- Dial values: `DESIGN_VARIANCE 5`, `MOTION_INTENSITY 3`, `VISUAL_DENSITY 7`。
- 该 skill 原本不主打 dense product UI，因此只采用它的反模板、视觉纪律、状态完整性、响应式和 pre-flight 规则，不照搬 landing page hero、logo wall、scrolltelling 等营销页模式。

视觉命名：`War Dossier`。中文描述为“军帐案牍 + 战略沙盘”，不是古风卷轴，也不是普通 SaaS dashboard。

视觉方向：

- 克制、清晰、偏策略推演工具台。
- 背景使用低饱和冷灰纸面，避免大面积暗色、仿古黄纸、木纹、卷轴和装饰图形。
- 卡片圆角不超过 `8px`，边框清楚，阴影轻或不用阴影。
- 字体层级紧凑：页面标题、面板标题、卡片标题、正文、辅助文本。
- 不使用 hero、营销文案区、装饰性渐变背景。
- 不使用书法字体、仿古纹样、红金满屏、三国手游式武将卡。

Theme lock：

- 第一版锁定 light theme，不做局部明暗反转。
- 页面根背景、卡片、事件面板、结局面板必须处于同一套浅色 token。
- 后续若加 dark mode，应通过 CSS variables 整体切换，不允许单个 section 独立变暗。

颜色 token：

| Token | Hex | 用途 |
| --- | --- | --- |
| `--background` | `#F4F6F2` | 页面底色，冷灰纸面 |
| `--surface` | `#FCFCF7` | 普通卡片和面板 |
| `--surface-raised` | `#FFFFFF` | sticky 事件面板、浮层 |
| `--foreground` | `#171B1F` | 主文字 |
| `--muted-foreground` | `#68716C` | 辅助文字 |
| `--border` | `#D8DDD3` | 卡片边框、分隔线 |
| `--accent` | `#2F6F68` | 曹营主色、可执行决策、正向重点 |
| `--accent-foreground` | `#F7FFFC` | accent 上文字 |
| `--warning` | `#B7791F` | 警戒、老将压力、谣言 |
| `--danger` | `#B24A3F` | 背叛、兵变、失败风险 |
| `--info` | `#4F6472` | 情报、荀彧建议、系统提示 |

颜色规则：

- 稳定 / 正向：冷绿或青绿。
- 警戒：琥珀色。
- 危险：克制红色。
- 中性：灰阶。
- 整页只使用 `--accent` 作为主 accent，不随机引入蓝紫、霓虹、金色渐变。
- 状态色只用于语义状态，不能把每张卡片染成不同颜色。
- 禁止 AI 紫蓝渐变、纯黑背景、满屏红金、暖米色 + 黄铜 + 咖啡色的仿古默认组合。

字体：

- UI 默认字体：`system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans CJK SC", sans-serif`。
- 数字和调试信息：`ui-monospace, "SF Mono", "JetBrains Mono", monospace`。
- 不使用默认 serif，不使用书法字体。三国气质通过结构、留白、色彩和文案建立。
- 页面标题使用 `font-semibold` 或 `font-bold`，避免夸张 display size。桌面 H1 建议 `text-2xl` 到 `text-3xl`，移动端 `text-xl`。

形状和线条：

- 全局卡片半径使用 `rounded-lg`，约 `8px`。
- 小标签使用 `rounded-md`，按钮可使用 `rounded-md` 或 `rounded-lg`，不使用 pill 作为默认。
- 卡片边框使用 `1px`，阴影极轻或不用阴影。
- 可用细线、分隔线和淡背景区分层级，不用多层嵌套卡片。

### 8.7 高保真组件样式

`HeaderBar`：

- 高度桌面 `64px` 左右，移动端自然高度。
- 左侧为产品名 `乱世人心`，旁边小号文字显示 `吕布来投 Demo`。
- 中间或右侧显示回合进度 `第 N / 10 回合`，使用 mono 数字。
- 右侧为 `重开一局` 按钮，使用 outline variant，带 lucide `RotateCcw` 图标。
- Header 不出现天气、城市、版本号、滚动提示等装饰性 meta。

`DashboardPanel`：

- 指标卡采用紧凑网格：桌面 4 列，`md` 2 列，移动端 1 到 2 列。
- 每张卡包含：指标名、当前值、趋势/状态短语、左侧 3px 语义色条。
- 数值使用 mono 字体，风险型指标高值显示 warning 或 danger，收益型指标低值显示 warning 或 danger。
- 不使用大号进度条背景轨道，避免看起来像通用后台模板。

`CharacterPanel`：

- 吕布卡在桌面端可横跨 2 列，形成视觉主角。
- 每张人物卡包含：姓名、身份短语、1 个主要状态 Badge、3 到 5 个关键 stat row。
- stat row 使用文字和值，不使用粗重进度条。
- 吕布卡顶部使用 `--danger` 或 `--warning` 风险色细线，但卡面仍保持浅色。
- 张辽卡显示“倾向曹营 / 摇摆 / 旧主情重”等状态短语，而不是只列数字。

`EventPanel`：

- 作为右侧 sticky 决策案牍，使用 `surface-raised`、清晰边框、轻阴影。
- 顶部显示小号回合和主题，事件标题使用 `text-xl` 到 `text-2xl`。
- 事件正文使用较高行距，中文阅读建议 `leading-7`。
- 4 个决策按钮采用纵向卡片按钮。每个按钮包含标题、描述、标签组。
- 按钮 hover 时只改变边框、背景和轻微 `translate-y[-1px]`，不使用发光。
- 高风险选项只用 Badge 标出，不把整个按钮涂红。

`ChroniclePanel`：

- 使用“奏报流”而不是普通日志表。
- 每条纪事左侧可有类型 Badge，正文是短段落。
- warning 条目使用细边框和浅色背景提示，不使用全红 alert。
- 最新条目位置必须一致。推荐最新在上，便于玩家立刻看到反馈。

`EndingPanel`：

- 结局名是页面最高层级文字，但不做 hero。
- 展示三块内容：结局描述、评价、最终指标摘要。
- 失败结局使用 danger 语义，成功或隐藏高分项使用 accent 语义。
- 提供重开按钮，不再提供普通事件选择。

`DebugPanel`：

- 视觉上弱化，默认折叠。
- JSON 区域使用 mono 字体、浅灰背景、固定最大高度和滚动。

### 8.8 UX 交互设计

- 玩家点击选择后，按钮立即进入 disabled 状态，防止重复提交。
- 状态更新后，EventPanel 切换到下一事件，ChroniclePanel 写入决策与奏报。
- 桌面端保持 EventPanel sticky，玩家滚动查看纪事时仍能看到当前决策。
- 移动端当前事件置顶，避免玩家先读大量状态再找到操作入口。
- 重开一局不刷新页面，直接恢复 `initialWorld`，焦点回到 EventPanel。
- 错误状态用可读文案说明，例如“当前事件缺失，已记录到 DebugPanel”，避免白屏。
- 所有交互状态必须支持键盘 focus，按钮文本不能在桌面端换行。

动效：

- `MOTION_INTENSITY 3`：只做轻量状态反馈，不做滚动动画、不做视差、不做持续循环动效。
- 允许：hover 背景变化、active 轻压、事件切换 `opacity` 过渡。
- 必须尊重 `prefers-reduced-motion`。减少动效时保留状态变化，不做位移。

### 8.9 UI pre-flight

实现完成前必须检查：

- 页面没有 AI 紫蓝渐变、霓虹外发光、滚动提示、版本号装饰、天气城市装饰。
- 只有一个主 accent，状态色仅表达真实语义。
- 卡片半径、按钮半径、边框风格一致。
- 桌面和移动端文本不溢出、不重叠，按钮标签不换行。
- EventPanel 在桌面端 sticky 可用，在移动端顺序置顶。
- 所有普通 UI 文案不使用英文 filler，不混用无意义诗性短句。
- 可见 UI 文案中不使用 em dash 或 en dash 作为装饰性分隔。
- 空状态、错误态、结局态、Debug 折叠态都有明确 UI。
- 不使用 hand-rolled SVG 图标。按钮图标优先使用 lucide-react 中已有图标。

### 8.10 交互状态

- Hover：决策按钮边框和背景轻微变化。
- Focus：键盘可见焦点，保证可访问性。
- Disabled：选择提交过程中按钮禁用。
- Empty：无纪事时显示“尚无记录”。
- Error：当前事件缺失、结局缺失、条件解析失败时用 `Alert` 展示可读错误，同时 Debug 中保留 warning。
- Reset：重开一局会恢复 `initialWorld`，但不刷新页面。

### 8.11 展示规则

- 正常 UI 展示模糊风险，不直接暴露所有隐藏变量。
- 选项不显示精确加减值，只显示文案和标签。
- Debug 面板显示全量状态，便于调试。
- 页面信息密度偏高、视觉克制、适合反复推演。
- 响应式是第一版交付要求，不作为后续优化项。

## 9. 错误处理

- 当前事件不存在：显示“事件缺失”状态，页面不崩。
- 选项 ID 无效：忽略操作并记录 warning。
- Effect 路径不存在：跳过并记录 warning。
- 条件表达式解析失败：视为 `false`，记录 warning。
- 无可用事件：Director fallback 到下一个主线事件。
- 无结局匹配：返回兜底结局。

## 10. 测试策略

至少覆盖：

- `effectEngine`
  - 加减、set、clamp。
  - `armyControl` 不被 `0-100` 夹断。
  - 不存在路径写入 warning。
- `directorEngine`
  - 按回合、条件、优先级选事件。
  - 已解决事件不会重复出现。
  - fallback 能推进主线。
- `endingEngine`
  - 识别 7.2 中定义的全部 8 个结局。
  - 高风险失败结局优先。
- `worldStore.choose`
  - 能应用效果。
  - 能推进回合。
  - 能写入 chronicle。
  - 能进入结局。

交付前运行：

```text
npm install
npm run typecheck
npm test
npm run build
```

并启动 dev server，用浏览器验证：

- 首页非空。
- 当前事件可见。
- 选项可点击。
- 状态和纪事能变化。
- 10 回合后进入结局页。
- 桌面和移动视口下布局可读，按钮、卡片、文本不溢出或重叠。

## 11. 初始化交付标准

完成实现后应满足：

- 当前目录是可运行的 git 仓库。
- React + TypeScript 项目已初始化。
- 10 回合 Demo 可完整推演。
- README 写明运行、测试、扩展事件的方法。
- 规则引擎、事件数据、UI 组件边界清楚。
- Tailwind CSS + shadcn/ui 已配置并用于主要界面组件。
- 页面在桌面和移动端都有可用布局。
- Debug 面板可辅助后续数值调试。

## 12. 后续扩展

本次不做，但设计保留空间：

- Promise 系统强化：承诺未兑现触发怨气或信任变化。
- Relationship 系统强化：人物之间关系影响 NPC 行动。
- 条件效果：如吕布 `pride > 90` 时双将制衡额外增加怨气。
- 选择前预演：显示模糊影响，如军事收益高、老将压力上升。
- LLM 奏报：将结构化状态转为古风奏报和谋士建议。
- 事件编辑器：基于数据驱动结构做剧情配置界面。
