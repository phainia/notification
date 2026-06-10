export interface MetricFormatSpec {
  csv?: string;
  col?: string;
  fmt?: "pct" | "num";
  digits?: number;
  compact?: boolean;
  yoyMonths?: number;
}

export function metricDigits(spec: MetricFormatSpec): number {
  if (spec.digits !== undefined) return spec.digits;
  if (spec.compact) return 0;
  if (spec.csv === "macro/fng" && spec.col === "fng") return 0;
  if (spec.yoyMonths || spec.fmt === "pct") return 1;
  return 2;
}

export function roundMetricValue(value: number, digits: number): number {
  return Number(value.toFixed(digits));
}

export function formatMetricValue(
  value: number,
  spec: MetricFormatSpec,
  opts: { sign?: boolean; includeUnit?: boolean } = {}
): string {
  const digits = metricDigits(spec);
  const rounded = roundMetricValue(value, digits);
  const prefix = opts.sign && rounded > 0 ? "+" : "";
  const body = spec.compact
    ? rounded.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: digits })
    : rounded.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const unit = opts.includeUnit !== false && spec.fmt === "pct" ? "%" : "";
  return `${prefix}${body}${unit}`;
}
