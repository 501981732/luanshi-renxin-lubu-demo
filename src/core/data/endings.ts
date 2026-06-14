import type { Ending } from "../types/ending";

export const endings: Record<Ending["id"], Ending> = {
  camp_rebellion: {
    id: "camp_rebellion",
    title: "营中兵变",
    description: "吕布以清君侧为名，夜袭中军。夏侯惇仓促迎战，曹营大乱。",
    evaluation: "最严重失败。你既给了兵权，又没有建立信任或制衡。",
    tone: "failure",
  },
  lubu_defects_to_yuan: {
    id: "lubu_defects_to_yuan",
    title: "吕布投袁",
    description: "夜半，吕布营中火起。其率亲骑突围，投袁绍而去。",
    evaluation: "失败结局。若张辽已经归曹，可降低损失。",
    tone: "failure",
  },
  killed_tiger_left_wound: {
    id: "killed_tiger_left_wound",
    title: "斩虎留患",
    description: "吕布被制，曹营旧将称快。然降将人人自危，张辽沉默不言。",
    evaluation: "解决了吕布，但伤了降将政策。杀吕布不是万能答案。",
    tone: "mixed",
  },
  tiger_in_cage: {
    id: "tiger_in_cage",
    title: "猛虎入笼",
    description: "吕布虽仍骄横，却已知曹操能容其勇，亦能制其权。",
    evaluation: "最佳稳定结局。吕布可用，但不可完全放任。",
    tone: "success",
  },
  zhangliao_joins_cao: {
    id: "zhangliao_joins_cao",
    title: "张辽归曹",
    description: "张辽上书称旧恩不可忘，然天下大势不可逆。其愿留曹营，独领一军。",
    evaluation: "战略人才转化成功。即使吕布未来生变，曹操也获得张辽。",
    tone: "success",
  },
  win_with_tiger: {
    id: "win_with_tiger",
    title: "以虎破敌",
    description: "吕布数战破敌，袁绍前锋受挫。然其威名日盛，帐下多称奉先将军。",
    evaluation: "军事胜利，政治隐患。适合进入第二章削吕布兵权。",
    tone: "mixed",
  },
  tense_success: {
    id: "tense_success",
    title: "勉强收局",
    description: "吕布未反，袁绍未破营，曹营诸将也未离心。但帐中仍有暗流。",
    evaluation: "你守住了局面，却没有真正解决吕布问题。",
    tone: "mixed",
  },
  failed_balance: {
    id: "failed_balance",
    title: "驭人失衡",
    description: "曹营未至崩溃，却处处失衡。旧臣、降将与外敌压力交织成结。",
    evaluation: "失败结局。你没有让风险爆发，但也没有达成 Demo 的治理目标。",
    tone: "failure",
  },
};
