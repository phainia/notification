import { useEffect, useState } from "react";
import { loadCsv, pairs } from "../lib/csv";
import { last } from "../lib/transform";

export interface KpiSpec {
  title: string;
  csv: string;
  col: string;
  fmt?: "pct" | "num";
  digits?: number;
  /** 高位是好(绿)还是坏(红);undefined = 中性琥珀 */
  goodWhen?: "high" | "low";
  /** 额外说明,如阈值 */
  hint?: string;
}

export function KpiCard({ spec, onClick }: { spec: KpiSpec; onClick?: () => void }) {
  const [v, setV] = useState<{ date: string; value: number; prev: number | null } | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let dead = false;
    loadCsv(spec.csv)
      .then((t) => !dead && setV(last(pairs(t, spec.col))))
      .catch(() => !dead && setErr(true));
    return () => {
      dead = true;
    };
  }, [spec]);

  const d = spec.digits ?? 2;
  const delta = v && v.prev !== null ? v.value - v.prev : null;
  const deltaCls =
    delta === null || spec.goodWhen === undefined
      ? "text-ink-3"
      : (delta >= 0) === (spec.goodWhen === "high")
        ? "text-up"
        : "text-down";

  return (
    <button
      onClick={onClick}
      className="rise text-left rounded-lg border border-line bg-panel p-4 hover:border-line-2 transition-colors w-full"
    >
      <div className="text-xs text-ink-2">{spec.title}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="num text-2xl font-semibold text-ink">
          {err ? "—" : v ? v.value.toFixed(d) : "…"}
          {spec.fmt === "pct" && !err && v ? <span className="text-sm">%</span> : null}
        </span>
        {delta !== null && (
          <span className={`num text-xs ${deltaCls}`}>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(d)}
          </span>
        )}
      </div>
      <div className="num text-[10px] text-ink-3 mt-1">
        {v?.date ?? ""}
        {spec.hint ? ` · ${spec.hint}` : ""}
      </div>
    </button>
  );
}
