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
