import { describe, expect, it } from "vitest";
import { initialWorld } from "../data/initialWorld";
import { checkFinalEnding } from "./endingEngine";
import type { WorldState } from "../types/world";

const clone = () => structuredClone(initialWorld) as WorldState;

describe("endingEngine", () => {
  it("detects camp rebellion", () => {
    const world = clone();
    world.luBuArc.rebellionIntent = 80;
    world.characters.lv_bu.mentalState.grievance = 80;
    world.characters.lv_bu.armyControl = 20000;
    expect(checkFinalEnding(world).id).toBe("camp_rebellion");
  });

  it("detects defection to Yuan", () => {
    const world = clone();
    world.luBuArc.yuanShaoContact = 80;
    world.luBuArc.betrayalRisk = 80;
    world.characters.lv_bu.armyControl = 12000;
    expect(checkFinalEnding(world).id).toBe("lubu_defects_to_yuan");
  });

  it("detects killed tiger left wound", () => {
    const world = clone();
    world.characters.lv_bu.status = "imprisoned";
    world.metrics.internalStability = 40;
    world.metrics.surrenderedFactionRisk = 70;
    expect(checkFinalEnding(world).id).toBe("killed_tiger_left_wound");
  });

  it("detects tiger in cage", () => {
    const world = clone();
    world.luBuArc.betrayalRisk = 35;
    world.luBuArc.integrationProgress = 70;
    world.metrics.internalStability = 60;
    expect(checkFinalEnding(world).id).toBe("tiger_in_cage");
  });

  it("detects Zhang Liao joins Cao", () => {
    const world = clone();
    world.luBuArc.betrayalRisk = 55;
    world.characters.zhang_liao.mentalState.belonging = 75;
    world.characters.zhang_liao.mentalState.trust = 70;
    expect(checkFinalEnding(world).id).toBe("zhangliao_joins_cao");
  });

  it("detects win with tiger", () => {
    const world = clone();
    world.metrics.yuanShaoPressure = 20;
    world.luBuArc.militaryDependence = 70;
    world.luBuArc.betrayalRisk = 60;
    expect(checkFinalEnding(world).id).toBe("win_with_tiger");
  });

  it("detects tense success", () => {
    const world = clone();
    world.luBuArc.betrayalRisk = 80;
    world.characters.lv_bu.armyControl = 9000;
    expect(checkFinalEnding(world).id).toBe("tense_success");
  });

  it("falls back to failed balance", () => {
    const world = clone();
    world.metrics.internalStability = 20;
    world.metrics.yuanShaoPressure = 90;
    world.metrics.oldGuardPressure = 90;
    expect(checkFinalEnding(world).id).toBe("failed_balance");
  });
});
