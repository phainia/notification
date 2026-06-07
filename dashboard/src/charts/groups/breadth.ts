import type { GroupSpec } from "../types";

const SECTOR_NAMES: Record<string, string> = {
  XLK: "科技", XLF: "金融", XLE: "能源", XLV: "医疗", XLY: "可选消费",
  XLP: "必需消费", XLI: "工业", XLB: "材料", XLU: "公用", XLRE: "地产", XLC: "通讯",
};
const DEFAULT_ON = new Set(["XLK", "XLF", "XLE", "XLV", "XLY"]);

/** 宽度・板块(2 图) */
export const breadth: GroupSpec = {
  id: "breadth",
  title: "宽度・板块",
  charts: [
    {
      id: "sp500-breadth",
      title: "标普500 市场宽度(官方 $S5TH)",
      subtitle: "成分股收于均线上方占比 —— ≤15 washout / ≥85 过热",
      series: [
        { csv: "macro/breadth_official", col: "pct_above_ma200", name: ">MA200" },
        { csv: "macro/breadth_official", col: "pct_above_ma50", name: ">MA50", off: true },
        { csv: "macro/breadth_official", col: "pct_above_ma20", name: ">MA20", off: true },
        { csv: "macro/breadth", col: "breadth200", name: "行业级 >MA200(1999+)", off: true },
      ],
      y0: { fmt: "pct", min: 0, max: 100 },
      hLines: [
        { value: 15, label: "washout 15" },
        { value: 50, label: "牛熊线 50" },
        { value: 85, label: "过热 85" },
      ],
      note: "官方个股口径 2006-12 起(无幸存者偏差);更深历史用行业级代理(11 个行业 ETF)。",
      defaultYears: 10,
    },
    {
      id: "sector-strength",
      title: "板块强度(累计 RS 线)",
      subtitle: "行业 / SPY,ETF 上市首日重基 1.0;>1 = 累计跑赢",
      series: Object.entries(SECTOR_NAMES).map(([t, zh]) => ({
        csv: "macro/sector_strength",
        col: `${t}_rs_line`,
        name: `${zh} ${t}`,
        off: !DEFAULT_ON.has(t),
      })),
      y0: { name: "相对 SPY" },
      hLines: [{ value: 1, label: "1.0" }],
      note: "XLRE(2015-10)与 XLC(2018-06)上市晚,锚点不同 —— 跨板块比较水平只在同锚点内有效;图例可开关 11 个板块。",
      defaultYears: 10,
    },
  ],
};
