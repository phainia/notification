import { useEffect, useMemo, useRef, useState } from "react";
import type { ChartSpec, SeriesSpec } from "../charts/types";
import { baseOption, echarts, INK2, PALETTE, yAxis } from "../charts/theme";
import { loadCsv, pairs } from "../lib/csv";
import { stitch, yoy, scale as scalePairs, type Pair } from "../lib/transform";

const RANGES: { label: string; years: number | null }[] = [
  { label: "1Y", years: 1 },
  { label: "3Y", years: 3 },
  { label: "10Y", years: 10 },
  { label: "全部", years: null },
];

async function seriesData(s: SeriesSpec): Promise<Pair[]> {
  let d = pairs(await loadCsv(s.csv), s.col);
  if (s.append) {
    const b = pairs(await loadCsv(s.append.csv), s.append.col);
    d = stitch(d, b, s.append.cut);
  }
  if (s.yoyMonths) d = yoy(d, s.yoyMonths);
  if (s.scale !== undefined) d = scalePairs(d, s.scale);
  return d;
}

export function ChartCard({ spec }: { spec: ChartSpec }) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [err, setErr] = useState("");
  const [latest, setLatest] = useState<{ date: string; value: number } | null>(null);
  const [range, setRange] = useState<number | null>(spec.defaultYears ?? 10);

  // 数据 + 渲染
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const data = await Promise.all(spec.series.map(seriesData));
        if (dead || !ref.current) return;
        const chart = echarts.init(ref.current);
        chartRef.current = chart;

        const first = data[0];
        if (first.length) setLatest({ date: first[first.length - 1][0], value: first[first.length - 1][1] });

        const opt: Record<string, unknown> = {
          ...baseOption(),
          yAxis: [
            yAxis({ ...spec.y0, position: "left" }),
            ...(spec.y1 ? [yAxis({ ...spec.y1, position: "right" })] : []),
          ],
          series: spec.series.map((s, i) => ({
            type: "line",
            name: s.name,
            data: data[i],
            yAxisIndex: s.axis ?? 0,
            showSymbol: false,
            connectNulls: false,
            step: s.step ? "end" : undefined,
            lineStyle: { width: 1.4 },
            emphasis: { focus: "series" },
            areaStyle: s.area ? { opacity: 0.12 } : undefined,
            color: s.color ?? PALETTE[i % PALETTE.length],
            // 参考线挂在第一条系列上
            markLine:
              i === 0 && (spec.hLines?.length || spec.vLines?.length)
                ? {
                    symbol: "none",
                    silent: true,
                    label: { color: INK2, fontSize: 10, position: "insideEndTop" },
                    lineStyle: { color: "#575652", type: "dashed", width: 1 },
                    data: [
                      ...(spec.hLines ?? []).map((h) => ({ yAxis: h.value, label: { formatter: h.label ?? String(h.value) } })),
                      ...(spec.vLines ?? []).map((v) => ({ xAxis: v.date, label: { formatter: v.label ?? v.date } })),
                    ],
                  }
                : undefined,
          })),
          legend: {
            ...(baseOption().legend as object),
            selected: Object.fromEntries(spec.series.filter((s) => s.off).map((s) => [s.name, false])),
          },
        };
        chart.setOption(opt);
        setState("ready");
      } catch (e) {
        if (!dead) {
          setErr(String(e));
          setState("error");
        }
      }
    })();
    const onResize = () => chartRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      dead = true;
      window.removeEventListener("resize", onResize);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [spec]);

  // 区间切换
  useEffect(() => {
    const c = chartRef.current;
    if (!c || state !== "ready") return;
    if (range === null) {
      c.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
    } else {
      const end = latest ? new Date(latest.date).getTime() : Date.now();
      const start = end - range * 365.25 * 86400_000;
      c.dispatchAction({ type: "dataZoom", startValue: start, endValue: end });
    }
  }, [range, state, latest]);

  const latestText = useMemo(() => {
    if (!latest) return "";
    const v = latest.value;
    const s = Math.abs(v) >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : v.toFixed(2);
    return `${s}${spec.y0?.fmt === "pct" ? "%" : ""}`;
  }, [latest, spec]);

  return (
    <div className="rise rounded-lg border border-line bg-panel p-4 hover:border-line-2 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight">{spec.title}</h3>
          {spec.subtitle && <p className="text-xs text-ink-2 mt-0.5 truncate">{spec.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {latest && (
            <span className="num text-xs px-2 py-1 rounded bg-panel-2 border border-line text-amber" title={`首列系列最新值 · ${latest.date}`}>
              {latestText}
              <span className="text-ink-3 ml-1.5">{latest.date.slice(2)}</span>
            </span>
          )}
          <div className="flex rounded border border-line overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setRange(r.years)}
                className={`num px-2 py-1 text-[11px] transition-colors ${
                  range === r.years ? "bg-amber/15 text-amber" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative h-[340px]">
        <div ref={ref} className="absolute inset-0" />
        {state === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center text-ink-3 text-sm num animate-pulse">loading…</div>
        )}
        {state === "error" && (
          <div className="absolute inset-0 flex items-center justify-center text-down text-xs px-6 text-center">{err}</div>
        )}
      </div>
      {spec.note && <p className="text-[11px] leading-relaxed text-ink-3 mt-2 border-t border-line pt-2">{spec.note}</p>}
    </div>
  );
}
