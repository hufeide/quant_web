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
    { n: '总览与智能信号', ms: ['workbench', 'home', 'radar', 'regime', 'atlas', 'atlas2'] },
    { n: '投资决策闭环', ms: ['decision', 'construction'] },
    { n: 'AI 智能体系', ms: ['demo', 'fusion', 'ai', 'agent', 'aiagents', 'researchos', 'arena', 'aiops'] },
    { n: '自上而下研究', ms: ['macro', 'industry', 'allocation', 'overseas', 'theme', 'sustain'] },
    { n: '分资产研究', ms: ['equity', 'bond', 'fund', 'futures', 'commodity', 'options', 'rates'] },
    { n: '另类与一级市场', ms: ['primary', 'realestate', 'crypto', 'credit'] },
    { n: '量化与组合引擎', ms: ['factor', 'strategy', 'aipm', 'portfolio', 'execution', 'market'] },
    { n: '资管业务与客户', ms: ['insurance', 'wealth', 'client'] },
    { n: '数据与知识底座', ms: ['data', 'altdata', 'knowledge', 'platform'] },
    { n: '研究管理与成本', ms: ['rm', 'tax', 'senti'] },
    { n: '指数、发行与公司行为', ms: ['index', 'ecm', 'corpact'] },
    { n: '运营、流动性与货币市场', ms: ['ops', 'liquidity', 'mm'] },
    { n: '相对价值、微结构与地缘', ms: ['rv', 'micro', 'geo'] },
    { n: '另类实物与抵押品', ms: ['infra', 'collateral'] },
    { n: '报告合规与治理', ms: ['report', 'regtech'] },
    { n: '机构专用（对冲/养老/投行）', ms: ['hf', 'pension', 'ibank'] }
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
    report: { n: '绩效归因与报告', ic: '⎙', sub: 'Performance', desc: 'Brinson/Barra 归因、业绩报告自动化、客户账户核对、投研 KPI 与合规留痕。' },

    /* ---- 二期扩展模块 ---- */
    agent: { n: 'AI 智能体工厂', ic: '⬡', sub: 'Agent Factory', desc: '把投研流程封装为可编排、可评测、可审计的智能体：工具注册、记忆体系、多智能体辩论、工作流自动化与人机协同接管。' },
    aiops: { n: 'AI 工程与模型治理', ic: '⚛', sub: 'AI Ops & MRM', desc: '模型全生命周期治理：训练编排、特征漂移、评测基准、Prompt 版本、推理成本、模型风险管理与监管解释义务。' },
    theme: { n: '主题投资与概念挖掘', ic: '✧', sub: 'Thematic', desc: '从技术演进与政策叙事出发，自动发现主题、构建概念图谱、映射受益标的、跟踪叙事生命周期与拥挤退出。' },
    sustain: { n: '转型金融与碳市场', ic: '♻', sub: 'Transition', desc: '碳配额与 CCER 定价、企业转型路径评估、绿色债券与转型债、气候物理风险与搁浅资产测算。' },
    rates: { n: '利率与外汇衍生品', ic: '∿', sub: 'Rates & FX', desc: '利率互换与曲线交易、国债期货基差与 CTD、外汇远期掉期期权、跨币种基差与利率曲线套利。' },
    primary: { n: '一级市场与私募股权', ic: '◐', sub: 'Private Equity', desc: '一级项目库与融资轮次跟踪、估值与条款分析、PE/VC 基金业绩（IRR/TVPI）、Pre-IPO 与退出路径管理。' },
    realestate: { n: '不动产与 REITs', ic: '⌂', sub: 'Real Estate', desc: '公募 REITs 估值与分派、底层资产运营（出租率/租金）、城市与板块景气、不动产周期与开发商信用。' },
    crypto: { n: '数字资产与代币化', ic: '◊', sub: 'Digital Assets', desc: '加密资产行情与链上数据、稳定币与 DeFi 收益、衍生品资金费率、代币化 RWA 与合规托管。' },
    credit: { n: '结构化融资与 ABS', ic: '⊟', sub: 'Structured Credit', desc: 'ABS/RMBS/CLO 的资产池穿透、现金流分层与瀑布、提前还款与违约假设、评级与利差相对价值。' },
    insurance: { n: '保险资管与负债驱动', ic: '⛨', sub: 'Insurance & LDI', desc: '负债现金流与久期缺口、偿付能力与资本占用、会计与利润表约束、长期资金的战略配置与再投资风险。' },
    wealth: { n: '财富管理与智能投顾', ic: '☗', sub: 'Wealth & Robo', desc: '客户画像与风险测评、目标导向规划、智能组合推荐与陪伴、税务与费用优化、投顾话术与合规适当性。' },
    client: { n: '机构客户与业务运营', ic: '⌾', sub: 'Client Ops', desc: '机构客户档案与需求跟踪、渠道与路演管理、资金流预测、销售支持素材与客户满意度经营。' },
    market: { n: '做市与流动性提供', ic: '⇋', sub: 'Market Making', desc: '双边报价与库存管理、逆向选择风险、做市义务考核、ETF 与债券做市、跨品种对冲与风险中性化。' },
    platform: { n: '平台工程与投研效能', ic: '⌘', sub: 'Platform Eng', desc: '研究环境与算力供给、代码与数据版本、可复现实验、SDK 与 API 网关、平台可观测性与成本治理。' },
    regtech: { n: '监管科技与合规智能', ic: '⚖', sub: 'RegTech', desc: '法规变更追踪与影响分析、异常交易识别、内幕与利益冲突监控、信息隔离墙、监管报送与检查应对。' },

    /* ---- 三期引擎模块（add_function.md 扩展） ---- */
    radar: { n: '市场异常雷达', ic: '◎', sub: 'Anomaly Radar', desc: '汇聚价、量、波动、盘口、资金、期权、跨市场、信息八类实时异常，自动加工为带概率与预期收益的机会或风险线索。' },
    regime: { n: '市场状态引擎', ic: '∿', sub: 'Regime Engine', desc: '趋势/波动/流动性/信用/风险偏好五维状态识别与体制切换预测，驱动因子、策略、组合与执行参数的全局动态联动。' },
    aiagents: { n: 'AI 岗位智能体', ic: '♟', sub: 'Role Agents', desc: '投资经理、宏观/行业/基本面研究员、交易员、风控等 17 类岗位智能体，自动组队、记忆经验、反思纠错与观点竞争。' },
    researchos: { n: 'AI 自动研究工厂', ic: '⛭', sub: 'Research Factory', desc: '从自动提出问题、生成假设、寻找反例、取数做因子到回测、过拟合闸门、改进、成文跟踪的无人值守研究闭环。' },
    arena: { n: '预测竞技场', ic: '◬', sub: 'Forecast Arena', desc: '大模型、机器学习与统计模型对股票、宏观、利率、汇率同题竞赛，按真实结果排名、校准与动态集成。' },
    demo: { n: 'AI 实演中心', ic: '▶', sub: 'Live AI Demos', desc: '搜索与 AI 功能的可点击具体样例：真实多轮对话、跨模块分析过程与结果卡片，按提示即可完整体验（纯样例演示）。' },
    fusion: { n: 'AI 融合场景中心', ic: '✺', sub: 'AI Fusion Hub', desc: '覆盖全部业务模块的 200+ 个 AI 深度结合场景库，按角色与意图交互引导，每个场景可一键试运行、转技能流或加入我的工作台。' },
    decision: { n: '投资决策操作系统', ic: '➤', sub: 'Decision OS', desc: '研究到交易的决策中间层：机会中心、投资论点、预测到仓位、决策日志、投委会与投资生命周期，把研究真正变成仓位。' },
    construction: { n: '组合构建引擎', ic: '⊛', sub: 'Portfolio Construction', desc: '12 类机构级优化器统一工作台：均值方差、BL、风险平价、HRP、CVaR、Kelly、稳健与状态条件优化，回答"配多少、为什么"。' },
    workbench: { n: '我的 AI 工作台', ic: '✦', sub: 'My AI Workbench', desc: '面向个人投资者、基金经理、研究员三类人群的可搭建 AI 工作台：通过搜索与对话把全平台任意功能组装成专属技能流，围绕自己的目标自动化运行。' },
    aipm: { n: 'AI 组合驾驶舱', ic: '◐', sub: 'AI Portfolio Copilot', desc: 'AI 自动交易决策、动态风险预算与杠杆、尾部对冲 Overlay、危机防御模式、反事实引擎与可拖拽组合沙盘。' },

    /* ---- 四期：补齐缺失的投研板块 ---- */
    index: { n: '指数与基准研究', ic: '⊞', sub: 'Index & Benchmark', desc: '指数体系与编制规则、成分权重穿透、调整预测与资金冲击、指数复制与跟踪误差归因、指数增强超额归因、基准选择与定制合成基准。' },
    ecm: { n: '一级发行与资本市场', ic: '⊚', sub: 'Equity Capital Markets', desc: 'IPO 询价与打新、定增/配股/转债等再融资、限售解禁与股东减持、股本结构与股东行为、簿记建档与定价、ECM 事件对组合的影响与应对。' },
    corpact: { n: '公司行为与事件驱动', ic: '⚑', sub: 'Corporate Actions', desc: '分红派息与送转配股、并购重组与要约套利、分拆与重整、回购增持与股权激励、事件驱动策略库与信号看板。' },
    ops: { n: '投资运营与清算交收', ic: '⚙', sub: 'Investment Ops', desc: '交易确认与清算交收、现金与头寸管理、公司行动处理、托管与对账、费用与业绩报酬、差错管理与多账户份额登记。' },
    liquidity: { n: '流动性与负债管理', ic: '≈', sub: 'Liquidity & Funding', desc: '资产流动性分层、赎回与现金流预测、融资与抵押品、应急流动性预案、摆动定价与侧袋、流动性成本归因。' },
    mm: { n: '货币市场与资金面', ic: '⇹', sub: 'Money Market', desc: '央行操作与流动性投放、回购与质押融资、同业存单与票据、短端利率曲线、资金面情绪与跨季跨节、流动性传导监测。' },
    geo: { n: '地缘与政策风险', ic: '⛨', sub: 'Geopolitical Risk', desc: '地缘风险指数、制裁与出口管制清单、政策文本解析与传导、国别风险、供应链安全与关键物资依赖度。' },
    rv: { n: '跨资产相对价值', ic: '⇄', sub: 'Cross-Asset RV', desc: '股债性价比、AH 与跨境比价、内外盘商品价差、跨市场利差与汇率偏离、相对价值信号与交易结构。' },
    micro: { n: '交易微结构', ic: '⇶', sub: 'Market Microstructure', desc: '盘口与订单流、成交分布与买卖压力、竞价与集合竞价行为、日内流动性与冲击、微观结构异常与执行窗口。' },
    rm: { n: '研究管理与评级', ic: '✎', sub: 'Research Management', desc: '评级与目标价体系、一致预期与业绩超预期预测、研究覆盖与产能、研究员绩效、研报审阅留痕与推荐组合跟踪。' },
    tax: { n: '税务与成本', ic: '⌧', sub: 'Tax & Cost', desc: '资本利得与股息税、印花税与预提税、跨境税务与协定、税收损失收割、交易成本与总持有成本分析。' },
    senti: { n: '行为金融与情绪', ic: '☺', sub: 'Sentiment & Behavior', desc: '投资者情绪指数、新闻与社交情绪、搜索与关注度、资金流情绪、行为偏差诊断与情绪极值预警。' },
    infra: { n: '基础设施与实物资产', ic: '⛏', sub: 'Infrastructure', desc: '交通与能源基建、数据中心与通信、管网与仓储、设备租赁、航运与物流实物资产、特许经营与 PPP 项目。' },
    collateral: { n: '保证金与抵押品', ic: '⛁', sub: 'Margin & Collateral', desc: '保证金模型与测算、抵押品池与折扣率、抵押品优化与调配、追保预警与压力情形、集中清算与对手方风险。' },
    hf: { n: '对冲基金工作台', ic: '⚡', sub: 'Hedge Fund Desk', desc: '面向对冲基金的多空与杠杆、风险预算与因子暴露、事件驱动与套利、主经纪商与融资、交易成本分析与容量拥挤监测。' },
    pension: { n: '养老金与主权基金', ic: '♏', sub: 'Pension & SWF', desc: '资产负债管理（LDI）、负债现金流与久期缺口、支出政策与可持续提取、再投资风险、受托责任与治理、战略配置。' },
    ibank: { n: '投资银行与销售交易', ic: '⚔', sub: 'Investment Banking', desc: '做市与库存风险、ECM/DCM 与承销、结构化与证券化、销售交易与机构服务、跨资产解决方案、主经纪商与资本市场咨询。' }
  };

  /* ---------- 注册器 ---------- */
  // 子功能紧凑写法："名称|一句话说明|可选标签"
  function parseSub(fid, s, i) {
    var a = String(s).split('|');
    var n = (a[0] || '').trim(), d = (a[1] || '').trim();
    return { id: fid + '.' + (i + 1), n: n, d: d || n, labelOnly: !a[1], t: (a[2] || '').trim() };
  }
  QW.F = function (o) {
    if (!o.id || !o.m) throw new Error('feature 缺少 id/m');
    o.w = o.w || 6;
    o.tags = o.tags || [];
    o.metrics = o.metrics || [];
    o.data = o.data || [];
    o.algo = o.algo || [];
    o.out = o.out || [];
    o.links = o.links || [];
    o.subs = (o.subs || []).map(function (s, i) { return parseSub(o.id, s, i); });
    QW.features.push(o);
    QW.byId[o.id] = o;
    return o;
  };
  // 为已注册的功能面板追加子功能（供深化补充的注册文件使用）
  QW.S = function (fid) {
    var f = QW.byId[fid];
    if (!f) throw new Error('S(): 功能不存在 ' + fid);
    for (var i = 1; i < arguments.length; i++) {
      f.subs.push(parseSub(fid, arguments[i], f.subs.length));
    }
    return f;
  };
  // 统计：子功能总数 / 功能总数（面板 + 子功能）
  QW.subCount = function (mid) {
    return QW.features.reduce(function (a, f) { return a + ((!mid || f.m === mid) ? f.subs.length : 0); }, 0);
  };
  QW.panelCount = function (mid) {
    return QW.features.filter(function (f) { return !mid || f.m === mid; }).length;
  };
  QW.totalCount = function (mid) { return QW.panelCount(mid) + QW.subCount(mid); };

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
  V.flow = function (layers, titles, edges, o) {
    o = o || {};
    return { k: 'flow', height: o.height, layers: layers, titles: titles, edges: edges, colors: o.colors };
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
  // 生成表格：labels 传字符串数组时按 types 随机补齐其余列；传二维数组时视为完整行
  V.tgen = function (seed, cols, labels, o) {
    o = o || {};
    var r = g.MC.rng(seed);
    if (labels && labels.length && Array.isArray(labels[0])) {
      return { k: 'table', cols: cols, rows: labels, h: o.h };
    }
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
          else row.push((18 + r() * 78).toFixed(2));
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
