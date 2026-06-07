import { KpiCard, type KpiSpec } from "../components/KpiCard";
import { ChartCard } from "../components/ChartCard";
import type { ChartSpec } from "../charts/types";

/** 总览:六个温度计 KPI + 两张焦点图(情绪与宽度,最常看的)。 */
const KPIS: (KpiSpec & { nav: string })[] = [
  { title: "CNN Fear & Greed", csv: "macro/fng", col: "fng", digits: 0, goodWhen: "high", hint: "≤25 恐慌 / ≥75 贪婪", nav: "sentiment" },
  { title: "VIX", csv: "macro/credit_spread", col: "vix", goodWhen: "low", hint: ">30 高波动", nav: "rates" },
  { title: "标普500 > MA200 占比", csv: "macro/breadth_official", col: "pct_above_ma200", fmt: "pct", digits: 1, goodWhen: "high", hint: "≤15 washout / ≥85 过热", nav: "breadth" },
  { title: "股票 Put/Call(5日趋势看图)", csv: "macro/putcall_cboe", col: "equity_pc", goodWhen: "low", hint: ">1 恐慌 / <0.5 自满", nav: "sentiment" },
  { title: "高收益债 OAS", csv: "macro/credit_spread", col: "hy_oas_full", fmt: "pct", goodWhen: "low", hint: ">6% 信用承压", nav: "rates" },
  { title: "期限利差 10Y−2Y", csv: "macro/rates", col: "curve_10y_2y", fmt: "pct", goodWhen: "high", hint: "<0 倒挂", nav: "rates" },
];

const FOCUS: ChartSpec[] = [
  {
    id: "ov-fng",
    title: "CNN Fear & Greed",
    subtitle: "恐惧贪婪指数(0-100)· 官方 API",
    series: [{ csv: "macro/fng", col: "fng", name: "F&G" }],
    y0: { min: 0, max: 100 },
    hLines: [
      { value: 25, label: "恐慌 25" },
      { value: 75, label: "贪婪 75" },
    ],
    note: "API 2020-09~2021-01 回填段有占位脏值,做信号从 2021-02 起算。",
    defaultYears: 3,
  },
  {
    id: "ov-breadth",
    title: "标普500 市场宽度(官方)",
    subtitle: "成分股收于 200 日均线上方的占比 $S5TH",
    series: [
      { csv: "macro/breadth_official", col: "pct_above_ma200", name: ">MA200" },
      { csv: "macro/breadth_official", col: "pct_above_ma50", name: ">MA50", off: true },
    ],
    y0: { fmt: "pct", min: 0, max: 100 },
    hLines: [
      { value: 15, label: "washout 15" },
      { value: 85, label: "过热 85" },
    ],
    defaultYears: 3,
  },
];

export function Overview({ onNav }: { onNav: (id: string) => void }) {
  return (
    <div className="max-w-[1800px] space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPIS.map((k, i) => (
          <div key={k.title} style={{ animationDelay: `${i * 50}ms` }} className="rise">
            <KpiCard spec={k} onClick={() => onNav(k.nav)} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {FOCUS.map((c) => (
          <ChartCard key={c.id} spec={c} />
        ))}
      </div>
    </div>
  );
}
