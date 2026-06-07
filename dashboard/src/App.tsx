import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { GROUPS } from "./charts/groups";
import { ChartCard } from "./components/ChartCard";
import { Sidebar } from "./components/Sidebar";
import { Overview } from "./pages/Overview";

function useHashRoute(): [string, (id: string) => void] {
  const read = () => location.hash.replace(/^#\/?/, "") || "overview";
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const fn = () => setRoute(read());
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return [route, (id) => (location.hash = `#/${id}`)];
}

export default function App() {
  const [route, nav] = useHashRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const group = GROUPS.find((g) => g.id === route);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => mainRef.current?.scrollTo(0, 0), [route]); // main 才是滚动容器

  return (
    <div className="flex h-full terminal-bg">
      <Sidebar
        groups={GROUPS}
        active={route}
        onNav={(id) => {
          nav(id);
          setMenuOpen(false);
        }}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 shrink-0 border-b border-line flex items-center gap-3 px-4 md:px-6 bg-bg/70 backdrop-blur sticky top-0 z-20">
          <button className="md:hidden text-ink-2" onClick={() => setMenuOpen(true)} aria-label="打开菜单">
            <Menu size={20} />
          </button>
          <h1 className="text-[15px] font-semibold tracking-tight">{group ? group.title : "总览"}</h1>
          <span className="num text-[10px] text-ink-3 ml-auto hidden sm:block">
            free · official sources · daily auto-refresh
          </span>
        </header>
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          {group ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-[1800px]">
              {group.charts.map((c, i) => (
                <div key={c.id} style={{ animationDelay: `${i * 60}ms` }} className="rise">
                  <ChartCard spec={c} />
                </div>
              ))}
            </div>
          ) : (
            <Overview onNav={nav} />
          )}
        </main>
      </div>
    </div>
  );
}
