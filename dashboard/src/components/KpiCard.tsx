import { useEffect, useState } from "react";
import { loadCsv, pairs } from "../lib/csv";
import { last } from "../lib/transform";

export interface KpiSpec {
  title: string;
  csv: string;
  col: string;
  fmt?: "pct" | "num";
  digits?: number;
  /** 数值乘数(单位换算,如人 → 千人) */
  scale?: number;
  /** 高位是好(绿)还是坏(红);undefined = 中性灰 */
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
  const k = spec.scale ?? 1;
  const delta = v && v.prev !== null ? (v.value - v.prev) * k : null;
  const deltaCls =
    delta === null || spec.goodWhen === undefined
      ? "text-muted-foreground/60"
      : (delta >= 0) === (spec.goodWhen === "high")
        ? "text-up"
        : "text-down";

  return (
    <button
      onClick={onClick}
      className="rise text-left rounded-lg border border-border bg-card p-4 hover:border-input transition-colors w-full"
    >
      <div className="text-xs text-muted-foreground">{spec.title}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="num text-2xl font-semibold text-foreground">
          {err ? "—" : v ? (v.value * k).toFixed(d) : "…"}
          {spec.fmt === "pct" && !err && v ? <span className="text-sm">%</span> : null}
        </span>
        {delta !== null && (
          <span className={`num text-xs ${deltaCls}`}>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(d)}
          </span>
        )}
      </div>
      <div className="num text-[10px] text-muted-foreground/60 mt-1">
        {v?.date ?? ""}
        {spec.hint ? ` · ${spec.hint}` : ""}
      </div>
    </button>
  );
}
