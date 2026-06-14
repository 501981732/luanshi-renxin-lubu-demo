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
