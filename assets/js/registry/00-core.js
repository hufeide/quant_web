/* =============================================================
 * registry/00-core.js — 模块目录 + 功能注册器 + 图形工厂
 * 所有功能条目通过 QW.F(...) 注册；文档生成脚本复用同一份数据。
 * ============================================================= */
(function (g) {
  'use strict';

  var QW = g.QW = g.QW || {};
  QW.features = [];
  QW.byId = {};

  /* ---------- 模块目录 ---------- */
  QW.groups = [
    { n: '总览与智能中枢', ms: ['home', 'ai'] },
    { n: '自上而下研究', ms: ['macro', 'industry', 'allocation', 'overseas'] },
    { n: '分资产研究', ms: ['equity', 'bond', 'fund', 'futures', 'commodity', 'options'] },
    { n: '量化引擎', ms: ['factor', 'strategy', 'portfolio', 'execution'] },
    { n: '数据与运营', ms: ['data', 'altdata', 'knowledge', 'report'] }
  ];

  QW.modules = {
    home: { n: '投研工作台', ic: '◉', sub: 'Research Cockpit', desc: '全平台入口：盯盘、日程、任务、异动、组合与 AI 早报的统一视图，投研人员一天工作的起点。' },
    ai: { n: 'AI 智能中枢', ic: '✦', sub: 'AI Copilot', desc: '大模型 + 多智能体驱动的研究助手：自然语言取数建模、研报自动生成、事件因果推断、策略自动挖掘与投研知识问答。' },
    macro: { n: '宏观研究', ic: '◍', sub: 'Macro', desc: '增长—通胀—货币—信用—财政—外部六维框架，量化经济周期位置并映射到资产定价。' },
    industry: { n: '行业与产业链', ic: '▦', sub: 'Industry & Chain', desc: '中观景气：行业比较打分、产业链上下游传导、供需缺口、产能周期与渠道库存跟踪。' },
    allocation: { n: '大类资产配置', ic: '◔', sub: 'Asset Allocation', desc: '战略/战术配置：风险平价、Black-Litterman、美林时钟、宏观情景压力测试与再平衡执行。' },
    overseas: { n: '全球市场与外汇', ic: '⊕', sub: 'Global & FX', desc: '跨市场联动、外汇与利率平价、汇率对冲成本、国别风险与全球流动性追踪。' },
    equity: { n: '股票研究', ip: 1, ic: '▲', sub: 'Equity', desc: '个股全景：财务质量、估值、盈利预测一致性、股东与治理、技术形态与筹码结构。' },
    bond: { n: '固定收益', ic: '═', sub: 'Fixed Income', desc: '利率债与信用债：收益率曲线、久期与凸性、信用评级迁移、违约概率与转债定价。' },
    fund: { n: '基金研究', ic: '◇', sub: 'Fund Research', desc: '公募/私募/FOF：业绩归因、风格漂移、经理能力拆解、基金池管理与组合基金优化。' },
    futures: { n: '期货与 CTA', ic: '⇅', sub: 'Futures & CTA', desc: '基差与展期收益、持仓结构、跨期跨品种套利、CTA 时序与横截面动量体系。' },
    commodity: { n: '大宗商品', ic: '⬢', sub: 'Commodity', desc: '供需平衡表、库存周期、成本曲线、运费与升贴水、天气与产地扰动驱动的商品定价。' },
    options: { n: '期权与衍生品', ic: '⌥', sub: 'Derivatives', desc: '波动率曲面、希腊字母风险、波动率套利、结构化产品与雪球/凤凰票据定价与风控。' },
    factor: { n: '多因子研究', ic: '⧉', sub: 'Factor Lab', desc: '因子从构思到入库的完整流水线：定义、检验、正交、衰减监控、组合优化与因子择时。' },
    strategy: { n: '策略研发与回测', ic: '⚙', sub: 'Strategy Lab', desc: '可视化策略编排、事件驱动回测引擎、参数寻优、过拟合检验、模拟盘与实盘一致性校验。' },
    portfolio: { n: '组合管理与风控', ic: '◈', sub: 'Portfolio & Risk', desc: '持仓穿透、风险预算、VaR/ES、压力测试、极端相关性、合规限额与实时风控告警。' },
    execution: { n: '交易执行与 TCA', ic: '⇄', sub: 'Execution', desc: '算法交易下单、流动性与冲击成本预测、执行质量归因、券源与融券成本管理。' },
    data: { n: '数据与因子平台', ic: '▤', sub: 'Data Platform', desc: '数据接入、清洗、复权、时点数据库(PIT)、特征仓库、血缘与质量监控。' },
    altdata: { n: '另类数据与 ESG', ic: '⌗', sub: 'Alt Data & ESG', desc: '卫星、票据、招聘、App、舆情、供应链等另类数据，与 ESG/碳排放评估体系。' },
    knowledge: { n: '知识图谱与研报中心', ic: '⌸', sub: 'Knowledge', desc: '公司—人—产品—事件知识图谱、研报库语义检索、路演与调研记录、观点跟踪与复盘。' },
    report: { n: '绩效归因与报告', ic: '⎙', sub: 'Performance', desc: 'Brinson/Barra 归因、业绩报告自动化、客户账户核对、投研 KPI 与合规留痕。' }
  };

  /* ---------- 注册器 ---------- */
  QW.F = function (o) {
    if (!o.id || !o.m) throw new Error('feature 缺少 id/m');
    o.w = o.w || 6;
    o.tags = o.tags || [];
    o.metrics = o.metrics || [];
    o.data = o.data || [];
    o.algo = o.algo || [];
    o.out = o.out || [];
    o.links = o.links || [];
    QW.features.push(o);
    QW.byId[o.id] = o;
    return o;
  };

  /* ---------- 图形工厂（数据由 id 作种子生成，纯展示） ---------- */
  var P = g.MC.T.pal;
  var V = QW.V = {};

  V.line = function (seed, names, o) {
    o = o || {};
    var n = o.n || 60, cats = o.cats || (o.monthly ? g.MC.months(n) : g.MC.days(n));
    return {
      k: 'line', height: o.height, cats: cats, zero: o.zero, fy: o.fy,
      series: names.map(function (nm, i) {
        var d = o.mode === 'ou'
          ? g.MC.ou(seed + i, n, { mean: (o.mean || 3) + i * (o.gap || 1.2), sd: o.sd || .5 })
          : g.MC.walk(seed + i, n, { start: o.start || 100, vol: o.vol || .011, drift: (o.drift == null ? .0008 : o.drift) - i * 0.0004 });
        return { name: nm, data: d, area: i === 0 && names.length === 1, color: P[i % P.length] };
      })
    };
  };
  V.bar = function (seed, cats, o) {
    o = o || {};
    var r = g.MC.rng(seed);
    return {
      k: 'bar', height: o.height, cats: cats, fy: o.fy, target: o.target, legend: false,
      series: [{ name: o.name || '值', signColor: o.sign !== false, data: cats.map(function () { return +((o.center || 0) + (o.scale || 3) * g.MC.gauss(r)).toFixed(2); }) }]
    };
  };
  V.mbar = function (seed, cats, names, o) {
    o = o || {};
    var r = g.MC.rng(seed);
    return {
      k: 'bar', height: o.height, cats: cats, fy: o.fy,
      series: names.map(function (nm, i) {
        return { name: nm, color: P[i % P.length], data: cats.map(function () { return +Math.abs((o.center || 6) + (o.scale || 3) * g.MC.gauss(r)).toFixed(2); }) };
      })
    };
  };
  V.stack = function (seed, cats, names, o) {
    o = o || {};
    var r = g.MC.rng(seed);
    return {
      k: 'stack', height: o.height, cats: cats, area: o.area,
      series: names.map(function (nm, i) {
        return { name: nm, color: P[i % P.length], data: cats.map(function () { return +Math.abs(8 + 5 * g.MC.gauss(r)).toFixed(2); }) };
      })
    };
  };
  V.hbar = function (seed, names, o) {
    o = o || {};
    var r = g.MC.rng(seed);
    return {
      k: 'hbar', height: o.height, labelW: o.labelW || 92, diverge: o.diverge, signColor: o.sign, fv: o.fv,
      items: names.map(function (nm) { return { n: nm, v: +((o.center || 0) + (o.scale || 4) * g.MC.gauss(r)).toFixed(2) }; })
        .sort(function (a, b) { return b.v - a.v; })
    };
  };
  V.heat = function (seed, rows, cols, o) {
    o = o || {};
    return { k: 'heat', height: o.height, rows: rows, cols: cols, labelW: o.labelW || 78, matrix: g.MC.matrix(seed, rows.length, cols.length, { scale: o.scale || .5, center: o.center || 0 }) };
  };
  V.radar = function (seed, axes, names, o) {
    o = o || {};
    var r = g.MC.rng(seed);
    return {
      k: 'radar', height: o.height, axes: axes,
      series: (names || ['当前']).map(function (nm, i) {
        return { name: nm, color: P[i % P.length], data: axes.map(function () { return +(0.35 + 0.6 * r()).toFixed(2); }) };
      })
    };
  };
  V.donut = function (seed, names, o) {
    o = o || {};
    var r = g.MC.rng(seed);
    return {
      k: 'donut', height: o.height, center: o.center, centerSub: o.centerSub,
      items: names.map(function (nm, i) { return { n: nm, v: +(10 + 40 * r()).toFixed(1), color: P[i % P.length] }; })
    };
  };
  V.candle = function (seed, o) {
    o = o || {};
    return { k: 'candle', height: o.height, data: g.MC.ohlc(seed, o.n || 60, o.start || 3200) };
  };
  V.scatter = function (seed, n, o) {
    o = o || {};
    var r = g.MC.rng(seed), pts = [];
    for (var i = 0; i < (n || 90); i++) {
      var x = (o.xc || 20) + (o.xs || 8) * g.MC.gauss(r);
      pts.push([+x.toFixed(2), +((o.b || 0.4) * x + (o.a || 2) + (o.e || 4) * g.MC.gauss(r)).toFixed(2), 2 + r() * 3.5, r() > .5 ? P[0] : P[3]]);
    }
    return { k: 'scatter', height: o.height, points: pts };
  };
  V.hist = function (seed, o) {
    o = o || {};
    return { k: 'hist', height: o.height, seed: seed, mean: o.mean || 0.6, sd: o.sd || 2.4, skew: o.skew || 0.3, varLine: o.varLine == null ? -4.2 : o.varLine, varLabel: o.varLabel };
  };
  V.waterfall = function (items, o) {
    o = o || {};
    return { k: 'waterfall', height: o.height, items: items };
  };
  V.treemap = function (seed, names, o) {
    o = o || {};
    var r = g.MC.rng(seed);
    return {
      k: 'treemap', height: o.height,
      items: names.map(function (nm) { return { n: nm, v: 10 + 90 * r(), chg: +(3.2 * g.MC.gauss(r)).toFixed(2) }; })
    };
  };
  V.sankey = function (layers, links, o) {
    o = o || {};
    return { k: 'sankey', height: o.height, layers: layers, links: links };
  };
  V.network = function (nodes, edges, o) {
    o = o || {};
    return { k: 'network', height: o.height, nodes: nodes, edges: edges };
  };
  V.gauge = function (v, label, sub, o) {
    o = o || {};
    return { k: 'gauge', height: o.height, value: v, label: label, sub: sub };
  };
  V.band = function (seed, o) {
    o = o || {};
    return { k: 'band', height: o.height, seed: seed, mean: o.mean, sd: o.sd, spread: o.spread, n: o.n || 36, split: o.split, name: o.name, cats: o.cats };
  };
  V.timeline = function (items, o) {
    o = o || {};
    return { k: 'timeline', height: o.height, items: items };
  };
  // 表格（HTML 渲染）
  V.table = function (cols, rows, o) {
    o = o || {};
    return { k: 'table', cols: cols, rows: rows, h: o.h };
  };
  // 生成随机表格行
  V.tgen = function (seed, cols, labels, o) {
    o = o || {};
    var r = g.MC.rng(seed);
    return {
      k: 'table', cols: cols, h: o.h,
      rows: labels.map(function (lb) {
        var row = [lb];
        for (var i = 1; i < cols.length; i++) {
          var spec = (o.types || [])[i - 1] || 'num';
          if (spec === 'pct') {
            var pv = 100 * (r() - .45);
            row.push({ v: (pv > 0 ? '+' : '') + pv.toFixed(2) + '%', c: pv >= 0 ? 'up' : 'dn' });
          } else if (spec === 'sig') {
            var si = Math.floor(r() * 4);
            row.push({ v: ['买入', '增持', '中性', '减持'][si], b: ['ok', 'ok', 'mid', 'bad'][si] });
          }
          else if (spec === 'big') row.push(g.MC.fmt(1e8 + r() * 9e9, 1));
          else if (spec === 'bar') row.push({ bar: r() });
          else row.push((r() * 100).toFixed(2));
        }
        return row;
      })
    };
  };
  // 列表（HTML 渲染）
  V.list = function (items, o) { return { k: 'list', items: items, h: (o || {}).h }; };
  // AI 对话（HTML 渲染）
  V.chat = function (msgs, ph) { return { k: 'chat', msgs: msgs, ph: ph }; };
  // 自定义 HTML
  V.html = function (h) { return { k: 'html', html: h }; };
})(window);
