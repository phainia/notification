#!/usr/bin/env python3
"""扫描 data/{macro,tickers,spot}/*.csv,生成 data/catalog.json —— 指标目录(metric catalog)。

供外部 AI agent / 第三方按 catalog 来 list 有哪些指标、每个指标有哪些列,再按需拉对应 CSV
(data_url)做时间区间查询。纯标准库,无 pandas 依赖,可独立跑:

    python feeds/catalog.py

也会被 run_all.py 末尾调用,随每日数据刷新一起 commit。catalog.json 与 CSV 同样通过
公开 GitHub raw 可读,无需任何后端。
"""
import csv
import json
import os
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.normpath(os.path.join(HERE, "..", "data"))
RAW_BASE = "https://raw.githubusercontent.com/riverfjs/notification/main/data"

# 目录 → catalog 里的 type
TYPES = {"macro": "macro", "tickers": "ticker", "spot": "spot"}

# 核心指标的人类可读标题 + 描述(键为 "<dir>/<name>")。未列出的用文件名兜底,
# tickers/spot 走程序化描述。新增指标无需在此登记(只是少了中文描述)。
DESCRIPTIONS = {
    "macro/rates": ("市场利率与政策利率", "美债收益率(3m/2y/10y)、有效联邦基金利率、期限利差(10y-2y / 10y-3m,倒挂为衰退预警)"),
    "macro/credit_spread": ("信用利差", "投资级/高收益信用利差,反映信用风险与流动性压力"),
    "macro/fng": ("CNN 恐惧贪婪指数", "Fear & Greed 总分(0-100)及分量:动量、52周强弱、麦克莱伦宽度、5日期权PC、VIX、垃圾债利差、避险偏好;含 fng_rating 文字档位"),
    "macro/jobs_monthly": ("月度就业", "非农就业人数(千)、失业率(%)"),
    "macro/claims_weekly": ("每周初请失业金", "初次申请失业救济人数(周频)"),
    "macro/us_inflation_releases": ("通胀数据发布", "CPI/PPI/PCE 总体与核心,及其环比(mom)/同比(yoy)"),
    "macro/us_growth_releases": ("增长数据发布", "GDP 等增长相关官方发布"),
    "macro/inflation_monetary": ("货币与通胀", "货币供应/通胀相关货币侧指标"),
    "macro/michigan_sentiment": ("密歇根消费者信心", "密歇根大学消费者信心指数及通胀预期"),
    "macro/retail": ("零售销售", "零售销售总额及核心"),
    "macro/home_sales_prices": ("房屋销售与价格", "成屋/新屋销售与房价"),
    "macro/housing_supply": ("住房供给", "住房库存/月供给量"),
    "macro/vehicle_sales": ("汽车销售", "轻型车销售年化"),
    "macro/mfg_orders_pmi": ("制造业订单与PMI", "制造业新订单、PMI"),
    "macro/ism_pmi": ("ISM PMI", "ISM 制造业/非制造业 PMI"),
    "macro/wei": ("周度经济指数", "WEI 高频经济活动指数(周频)"),
    "macro/naaim": ("NAAIM 持仓敞口", "主动型基金经理股票敞口指数(情绪)"),
    "macro/aaii": ("AAII 散户情绪", "散户多空中性比例调查"),
    "macro/putcall": ("期权 PC 比(历史)", "CBOE 期权 put/call 比(2003-2019 冻结口径,equity/index/total)"),
    "macro/putcall_cboe": ("期权 PC 比(CBOE)", "CBOE 期权 put/call 比当前口径"),
    "macro/cot_sp500": ("COT 标普500", "CFTC 持仓报告:S&P500 期货各类持仓"),
    "macro/cot_nasdaq100": ("COT 纳指100", "CFTC 持仓报告:Nasdaq100 期货各类持仓"),
    "macro/cot_legacy": ("COT legacy 口径", "CFTC legacy 口径持仓(1986+)"),
    "macro/breadth": ("市场宽度", "行业/大盘宽度指标"),
    "macro/breadth_official": ("官方宽度", "官方 $S5xx 宽度系列"),
    "macro/breadth_stocks": ("成分股宽度", "按时点成分自算的宽度"),
    "macro/sector_strength": ("行业相对强度", "11 个 SPDR 行业 ETF(XL*)的 63 日相对强度与趋势线"),
    "macro/copper_gold_ppi": ("铜金比 vs PPI", "铜金比与生产者价格指数对照"),
    "macro/oil_gold_cpi": ("油金比 vs CPI", "油金比与消费者价格指数对照"),
    "macro/personal_finance": ("个人收支", "个人收入、支出、储蓄率"),
    "macro/us_trade_orders": ("贸易与订单", "贸易差额、耐用品/工厂订单"),
}


def infer_frequency(dates):
    """根据最后两个日期的间隔粗略推断频率。"""
    if len(dates) < 2:
        return "unknown"
    try:
        a = datetime.fromisoformat(dates[-2][:10])
        b = datetime.fromisoformat(dates[-1][:10])
    except ValueError:
        return "unknown"
    gap = abs((b - a).days)
    if gap <= 4:
        return "daily"
    if gap <= 10:
        return "weekly"
    if gap <= 45:
        return "monthly"
    return "quarterly"


def read_meta(path):
    """读 CSV 首行得列名、首末行得日期范围(跳过 # 注释行)。返回 None 表示空文件。"""
    with open(path, newline="") as f:
        rows = [r for r in csv.reader(f) if r and not r[0].lstrip().startswith("#")]
    if len(rows) < 2:
        return None
    header = [h.strip() for h in rows[0]]
    columns = header[1:]  # 首列恒为 date
    body = rows[1:]
    dates = [r[0][:10] for r in body if r and r[0]]
    if not dates:
        return None
    return columns, dates[0], dates[-1], infer_frequency(dates), len(dates)


def build():
    metrics = []
    for sub, typ in TYPES.items():
        d = os.path.join(DATA_DIR, sub)
        if not os.path.isdir(d):
            continue
        for fn in sorted(os.listdir(d)):
            if not fn.endswith(".csv"):
                continue
            name = fn[:-4]
            mid = f"{sub}/{name}"
            meta = read_meta(os.path.join(d, fn))
            if not meta:
                continue
            columns, first, last, freq, n = meta
            if mid in DESCRIPTIONS:
                title, desc = DESCRIPTIONS[mid]
            elif typ == "ticker":
                title, desc = name, f"{name} 日线行情(OHLCV:开高低收量)"
            elif typ == "spot":
                title, desc = name, f"{name} 现货收盘价"
            else:
                title, desc = name, ""
            metrics.append({
                "id": mid,
                "type": typ,
                "title": title,
                "description": desc,
                "columns": columns,
                "frequency": freq,
                "history_from": first,
                "updated_at": last,
                "sample_count": n,
                "data_url": f"{RAW_BASE}/{mid}.csv",
            })

    metrics.sort(key=lambda m: m["id"])
    catalog = {
        "version": 1,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "total": len(metrics),
        "types": sorted({m["type"] for m in metrics}),
        "metrics": metrics,
    }
    out = os.path.join(DATA_DIR, "catalog.json")
    with open(out, "w") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
    print(f"catalog.json: {len(metrics)} metrics -> {out}")
    return out


if __name__ == "__main__":
    build()
