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
