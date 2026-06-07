import { Activity, Banknote, Factory, Flame, Gauge, LayoutGrid, Percent, X } from "lucide-react";
import type { GroupSpec } from "../charts/types";

const ICONS: Record<string, typeof Activity> = {
  overview: Gauge,
  consumption: Banknote,
  supply: Factory,
  inflation: Flame,
  rates: Percent,
  sentiment: Activity,
  breadth: LayoutGrid,
};

export function Sidebar({
  groups,
  active,
  onNav,
  open,
  onClose,
}: {
  groups: GroupSpec[];
  active: string;
  onNav: (id: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  const items = [{ id: "overview", title: "总览" }, ...groups.map((g) => ({ id: g.id, title: g.title }))];
  return (
    <>
      {/* 移动端遮罩 */}
      {open && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed md:static z-40 h-full w-60 shrink-0 border-r border-line bg-bg flex flex-col
                    transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-line">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="w-6 h-6 rounded" aria-hidden>
              <rect width="32" height="32" rx="6" fill="#131316" />
              <path d="M6 22 L13 13 L18 17 L26 8" stroke="#f5a524" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="leading-none">
              <div className="font-semibold text-[15px] tracking-tight">Macro Terminal</div>
              <div className="num text-[10px] text-ink-3 mt-1">riverfjs/notification</div>
            </div>
          </div>
          <button className="md:hidden text-ink-3 hover:text-ink" onClick={onClose} aria-label="关闭菜单">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {items.map((it) => {
            const Icon = ICONS[it.id] ?? Activity;
            const is = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => onNav(it.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors text-left
                  ${is ? "bg-amber/10 text-amber" : "text-ink-2 hover:bg-panel-2 hover:text-ink"}`}
              >
                <Icon size={15} strokeWidth={is ? 2.2 : 1.8} />
                {it.title}
              </button>
            );
          })}
        </nav>
        <div className="px-5 py-3 border-t border-line text-[10px] leading-relaxed text-ink-3">
          数据:官方免费源,GitHub Actions 每个交易日收盘后自动更新。
        </div>
      </aside>
    </>
  );
}
