import type { GroupSpec, SeriesSpec } from "../types";

const close = (ticker: string, name: string, off = false): SeriesSpec => ({
  csv: `tickers/${ticker}`,
  col: "c",
  name,
  off,
});

const SECTOR_ETFS: [string, string, boolean?][] = [
  ["XLK", "科技 XLK"],
  ["XLF", "金融 XLF"],
  ["XLE", "能源 XLE"],
  ["XLV", "医疗 XLV"],
  ["XLY", "可选消费 XLY"],
  ["XLP", "必需消费 XLP", true],
  ["XLI", "工业 XLI", true],
  ["XLB", "材料 XLB", true],
  ["XLU", "公用 XLU", true],
  ["XLRE", "地产 XLRE", true],
  ["XLC", "通讯 XLC", true],
];

/** 大盘 ETF(3 图):从 data/tickers 读取 yfinance 复权收盘价。 */
export const market: GroupSpec = {
  id: "market",
  title: "大盘 ETF",
  charts: [
    {
      id: "us-major-etfs",
      title: "美股大盘 ETF",
      subtitle: "SPY / QQQ / DIA / IWM / RSP / SPMO 复权收盘价",
      series: [
        close("SPY", "标普500 SPY"),
        close("QQQ", "纳指100 QQQ"),
        close("DIA", "道指 DIA"),
        close("IWM", "罗素2000 IWM"),
        close("RSP", "标普等权 RSP", true),
        close("SPMO", "标普动量 SPMO", true),
      ],
      y0: { name: "复权价格" },
      note: "价格来自 yfinance auto_adjust=True。不同 ETF 价格水平不可直接视为收益比较,需要看相对变化或使用对比缩放。",
      defaultYears: 3,
    },
    {
      id: "cross-asset-etfs",
      title: "跨资产 ETF",
      subtitle: "海外股市 / 债券信用 / 商品 / REITs",
      series: [
        close("EFA", "发达海外 EFA"),
        close("EEM", "新兴市场 EEM"),
        close("TLT", "长期美债 TLT"),
        close("HYG", "高收益债 HYG"),
        close("GLD", "黄金 GLD"),
        close("DBC", "商品 DBC"),
        close("VNQ", "REITs VNQ", true),
        close("PFF", "优先股 PFF", true),
      ],
      y0: { name: "复权价格" },
      note: "跨资产价格尺度不同,该图用于查看趋势与拐点;相对强弱可另看板块强度图。",
      defaultYears: 3,
    },
    {
      id: "sector-etfs",
      title: "行业 ETF",
      subtitle: "11 个 SPDR 行业 ETF 复权收盘价",
      series: SECTOR_ETFS.map(([ticker, name, off]) => close(ticker, name, off)),
      y0: { name: "复权价格" },
      note: "行业 ETF 上市时间不同。默认显示流动性和宏观敏感度较高的 5 个行业,其余可在图例打开。",
      defaultYears: 3,
    },
  ],
};
