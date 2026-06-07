/** ECharts 按需注册 + Macro Terminal 暗色主题。 */
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

export { echarts };

/** 系列默认调色:琥珀打头,冷暖相间,暗底高可读 */
export const PALETTE = [
  "#f5a524", // 琥珀(主)
  "#4cc2ff", // 天蓝
  "#2dd4a7", // 薄荷
  "#fb4d6d", // 玫红
  "#a78bfa", // 雾紫
  "#facc15", // 柠檬
  "#34bfd4", // 青
  "#f97350", // 橘红
  "#8ea0b5", // 蓝灰
  "#7dd956", // 草绿
  "#e879c9", // 粉紫
];

export const INK = "#e8e6e1";
export const INK2 = "#8b8a85";
export const LINE = "#232329";

/** 通用 option 骨架(各图在此基础上叠 series/axis) */
export function baseOption() {
  return {
    backgroundColor: "transparent",
    textStyle: { fontFamily: "IBM Plex Mono, IBM Plex Sans, monospace" },
    grid: { left: 8, right: 8, top: 38, bottom: 44, containLabel: true },
    legend: {
      top: 0,
      left: 0,
      icon: "rect",
      itemWidth: 10,
      itemHeight: 3,
      itemGap: 14,
      textStyle: { color: INK2, fontSize: 11 },
      inactiveColor: "#3d3d44",
      type: "scroll",
      pageIconColor: INK2,
      pageTextStyle: { color: INK2 },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1a1a1f",
      borderColor: "#2e2e36",
      textStyle: { color: INK, fontSize: 12 },
      axisPointer: {
        type: "cross",
        label: { backgroundColor: "#2e2e36", color: INK },
        crossStyle: { color: "#3d3d44" },
        lineStyle: { color: "#3d3d44" },
      },
      confine: true,
    },
    xAxis: {
      type: "time",
      axisLine: { lineStyle: { color: LINE } },
      axisLabel: { color: INK2, fontSize: 11, hideOverlap: true },
      splitLine: { show: false },
    },
    dataZoom: [
      { type: "inside", throttle: 50 },
      {
        type: "slider",
        height: 18,
        bottom: 6,
        borderColor: LINE,
        backgroundColor: "transparent",
        fillerColor: "rgba(245,165,36,0.10)",
        handleStyle: { color: "#3d3d44", borderColor: "#575652" },
        moveHandleStyle: { color: "#3d3d44" },
        textStyle: { color: "#575652", fontSize: 10 },
        dataBackground: { lineStyle: { color: "#2e2e36" }, areaStyle: { color: "rgba(255,255,255,0.04)" } },
        selectedDataBackground: { lineStyle: { color: "#f5a524" }, areaStyle: { color: "rgba(245,165,36,0.08)" } },
      },
    ],
  };
}

/** y 轴构造 */
export function yAxis(opts: { name?: string; fmt?: "pct" | "num"; min?: number | "dataMin"; max?: number; position: "left" | "right" }) {
  return {
    type: "value" as const,
    name: opts.name,
    nameTextStyle: { color: INK2, fontSize: 10, align: opts.position === "left" ? ("left" as const) : ("right" as const) },
    position: opts.position,
    min: opts.min,
    max: opts.max,
    scale: true,
    axisLine: { show: false },
    axisLabel: {
      color: INK2,
      fontSize: 11,
      formatter: opts.fmt === "pct" ? "{value}%" : undefined,
    },
    splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
  };
}
