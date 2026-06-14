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
