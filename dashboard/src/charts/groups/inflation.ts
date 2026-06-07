import type { GroupSpec } from "../types";

/** 通胀・货币(3 图) */
export const inflation: GroupSpec = {
  id: "inflation",
  title: "通胀・货币",
  charts: [
    {
      id: "copper-gold",
      title: "铜金比与 PPI",
      subtitle: "吨铜值多少盎司金:升=再通胀/risk-on,降=避险",
      series: [
        { csv: "macro/copper_gold_ppi", col: "copper_gold_ratio_daily", name: "铜金比(日,LME)" },
        { csv: "macro/copper_gold_ppi", col: "ppi_all_commod", name: "PPI 全商品 YoY", axis: 1, yoyMonths: 12 },
        { csv: "macro/copper_gold_ppi", col: "copper_gold_ratio", name: "铜金比(月,IMF)", off: true },
      ],
      y0: { name: "盎司金/吨铜" },
      y1: { name: "YoY", fmt: "pct" },
      note: "日频腿 = LME 现汇结算(T+1 滞后一日)÷ LBMA 现货金;纯 COMEX 因 2024 后关税溢价被弃用。",
      defaultYears: 10,
    },
    {
      id: "oil-gold",
      title: "油金比与 CPI",
      subtitle: "桶油值多少盎司金 —— 能源通胀温度计",
      series: [
        { csv: "macro/oil_gold_cpi", col: "oil_gold_ratio", name: "油金比" },
        { csv: "macro/oil_gold_cpi", col: "cpi_all_urban", name: "CPI YoY", axis: 1, yoyMonths: 12 },
        { csv: "macro/oil_gold_cpi", col: "wti_usd_bbl", name: "WTI($/桶)", axis: 1, off: true },
      ],
      y0: { name: "盎司金/桶" },
      y1: { name: "YoY", fmt: "pct" },
      defaultYears: 10,
    },
    {
      id: "inflation-expectations",
      title: "通胀与货币政策预期",
      subtitle: "盈亏平衡通胀 + 5y5y 远期 vs 联储目标利率",
      series: [
        { csv: "macro/inflation_monetary", col: "breakeven_5y", name: "5Y 盈亏平衡" },
        { csv: "macro/inflation_monetary", col: "fwd_5y5y_infl", name: "5y5y 远期通胀" },
        { csv: "macro/inflation_monetary", col: "breakeven_10y", name: "10Y 盈亏平衡", off: true },
        { csv: "macro/inflation_monetary", col: "fed_funds_target", name: "联储目标利率", axis: 1, step: true },
      ],
      y0: { name: "通胀预期", fmt: "pct" },
      y1: { name: "政策利率", fmt: "pct" },
      hLines: [{ value: 2, label: "2% 目标" }],
      defaultYears: 10,
    },
  ],
};
