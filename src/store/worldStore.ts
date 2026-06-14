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
  choosing: boolean;
  choose: (choiceId: string) => void;
  reset: () => void;
};

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  world: structuredClone(initialWorld),
  choosing: false,

  choose: (choiceId: string) => {
    const world = get().world;
    if (world.ending || get().choosing) return;

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

    set({ choosing: true });

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
      set({ world: next, choosing: false });
      return;
    }

    next.metrics.turn += 1;

    if (next.metrics.turn >= 10) {
      next.ending = checkFinalEnding(next);
      next.currentEventId = "ending";
      set({ world: next, choosing: false });
      return;
    }

    const nextEvent = pickNextEvent(next);
    next.currentEventId = nextEvent?.id ?? "ending";
    set({ world: next, choosing: false });
  },

  reset: () => {
    set({ world: structuredClone(initialWorld), choosing: false });
  },
}));
