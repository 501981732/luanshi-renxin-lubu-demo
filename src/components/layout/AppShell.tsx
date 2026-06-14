import { DashboardPanel } from "../panels/DashboardPanel";
import { CharacterPanel } from "../panels/CharacterPanel";
import { EventPanel } from "../panels/EventPanel";
import { ChroniclePanel } from "../panels/ChroniclePanel";
import { EndingPanel } from "../panels/EndingPanel";
import { DebugPanel } from "../panels/DebugPanel";
import { HeaderBar } from "./HeaderBar";
import { useWorldStore } from "../../store/worldStore";

export function AppShell() {
  const world = useWorldStore((state) => state.world);
  const choosing = useWorldStore((state) => state.choosing);
  const choose = useWorldStore((state) => state.choose);
  const reset = useWorldStore((state) => state.reset);
  const decision = world.ending ? <EndingPanel world={world} onReset={reset} /> : <EventPanel world={world} choosing={choosing} onChoose={choose} />;

  return (
    <div className="min-h-[100dvh]">
      <HeaderBar turn={world.metrics.turn} onReset={reset} />
      <main className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-6 xl:grid-cols-[minmax(0,1fr)_480px]">
        <div className="lg:hidden">{decision}</div>
        <section className="grid gap-5">
          <DashboardPanel world={world} />
          <CharacterPanel world={world} />
          <ChroniclePanel chronicle={world.chronicle} />
          <DebugPanel world={world} />
        </section>
        <section className="hidden lg:block">
          <div className="sticky top-[88px]">{decision}</div>
        </section>
      </main>
    </div>
  );
}
