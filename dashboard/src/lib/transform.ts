/** 序列变换:作用在 [date, value][] 上。 */

export type Pair = [string, number];

/** 同比 %:按【日历】回看 monthsBack 个月(默认 12)。
 *  之所以不按"期数"回看:月频序列偶有缺测(如 CPI 缺 2025-10,政府停摆),
 *  按期数会让其后所有点变成 13 个月变化(实测偏差 +0.44pp)。
 *  实现:月份键映射(同月多点取最后值,仅用于月频列);找不到对应月则跳过该点。 */
export function yoy(data: Pair[], monthsBack = 12): Pair[] {
  const byMonth = new Map<string, number>();
  for (const [d, v] of data) byMonth.set(d.slice(0, 7), v);
  const out: Pair[] = [];
  for (const [d, v] of data) {
    const y = +d.slice(0, 4);
    const m = +d.slice(5, 7);
    const total = y * 12 + (m - 1) - monthsBack;
    const key = `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
    const prev = byMonth.get(key);
    if (prev !== undefined && prev !== 0) out.push([d, (v / prev - 1) * 100]);
  }
  return out;
}

/** 数值缩放 */
export function scale(data: Pair[], k: number): Pair[] {
  return data.map(([d, v]) => [d, v * k]);
}

/** 两段序列拼接展示:a 提供 cut 之前,b 提供 cut 起(含)。 */
export function stitch(a: Pair[], b: Pair[], cut: string): Pair[] {
  return [...a.filter(([d]) => d < cut), ...b.filter(([d]) => d >= cut)];
}

/** 末值与上一值(给 KPI 卡用) */
export function last(data: Pair[]): { date: string; value: number; prev: number | null } | null {
  if (!data.length) return null;
  const [date, value] = data[data.length - 1];
  return { date, value, prev: data.length > 1 ? data[data.length - 2][1] : null };
}
