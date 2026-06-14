export type EffectOp = "+" | "-" | "set";

export type Effect = {
  target: string;
  op: EffectOp;
  value: number | string | boolean;
};
