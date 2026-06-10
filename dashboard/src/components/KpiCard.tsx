import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { SeriesSpec } from "../charts/types";
import { formatMetricValue, metricDigits, roundMetricValue } from "../lib/metricFormat";
import { seriesData } from "../lib/seriesData";
import { last } from "../lib/transform";

export interface KpiSpec extends Pick<SeriesSpec, "csv" | "col" | "append" | "yoyMonths" | "scale"> {
  title: string;
  fmt?: "pct" | "num";
  digits?: number;
  compact?: boolean;
  /** 高位是好(绿)还是坏(红);undefined = 中性灰 */
  goodWhen?: "high" | "low";
  /** 额外说明,如阈值 */
  hint?: string;
}

/** shadcn dashboard-01 的 KPI 卡范式:Description=标签 / Title=大数字 /
 *  Action=涨跌 Badge / Footer=注脚。标题与注脚各锁一行截断,同行等高。 */
export function KpiCard({ spec, onClick }: { spec: KpiSpec; onClick?: () => void }) {
  const [v, setV] = useState<{ date: string; value: number; prev: number | null } | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let dead = false;
    seriesData(spec)
      .then((d) => !dead && setV(last(d)))
      .catch(() => !dead && setErr(true));
    return () => {
      dead = true;
    };
  }, [spec]);

  const d = metricDigits(spec);
  const displayValue = v ? roundMetricValue(v.value, d) : null;
  const displayPrev = v?.prev !== null && v?.prev !== undefined ? roundMetricValue(v.prev, d) : null;
  const displayDelta = displayValue !== null && displayPrev !== null ? roundMetricValue(displayValue - displayPrev, d) : null;
  const hasDisplayDelta = displayDelta !== null && Math.abs(displayDelta) > 0;
  const fmtValue = (x: number) => formatMetricValue(x, spec, { includeUnit: false });
  const fmtDelta = (x: number) => formatMetricValue(x, spec, { sign: true, includeUnit: false });
  const deltaCls =
    displayDelta === null
      ? "text-muted-foreground"
      : spec.goodWhen === undefined
        ? displayDelta >= 0 ? "text-up" : "text-down"
        : (displayDelta >= 0) === (spec.goodWhen === "high")
          ? "text-up"
          : "text-down";
  const valueCls =
    !hasDisplayDelta
      ? "text-muted-foreground"
      : deltaCls;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
      title={`${spec.title}${spec.hint ? ` · ${spec.hint}` : ""}`}
      className="h-full overflow-hidden gap-1.5 py-4 cursor-pointer hover:border-input transition-colors"
    >
      <CardHeader className="min-w-0 px-4 gap-1 has-data-[slot=card-action]:grid-cols-[minmax(0,1fr)_auto]">
        <CardDescription className="min-w-0 text-xs truncate">{spec.title}</CardDescription>
        <CardTitle className="num min-w-0 truncate text-2xl whitespace-nowrap">
          {err ? "—" : v ? fmtValue(v.value) : "…"}
          {spec.fmt === "pct" && !err && v ? <span className="text-sm">%</span> : null}
        </CardTitle>
        {hasDisplayDelta && (
          <CardAction className="max-w-[5.5rem] overflow-hidden">
            <Badge
              variant="outline"
              className={`num max-w-full overflow-hidden text-ellipsis whitespace-nowrap ${valueCls}`}
              title={`上一期变化: ${fmtDelta(displayDelta)}`}
            >
              {fmtDelta(displayDelta)}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardFooter className="min-w-0 px-4">
        <span className="num min-w-0 max-w-full text-[10px] text-muted-foreground/60 truncate">
          {v?.date ?? ""}
          {spec.hint ? ` · ${spec.hint}` : ""}
        </span>
      </CardFooter>
    </Card>
  );
}
