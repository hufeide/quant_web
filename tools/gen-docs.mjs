// tools/gen-docs.mjs — 从功能注册表生成 FUNCTIONS.md（功能说明书）
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const files = ['assets/js/chartlib.js', 'assets/js/registry/00-core.js',
  ...fs.readdirSync(path.join(root, 'assets/js/registry')).sort().map(f => 'assets/js/registry/' + f)];
const sandbox = { console }; sandbox.window = sandbox; sandbox.globalThis = sandbox;
const ctx = vm.createContext(sandbox);
for (const f of files) new vm.Script(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f }).runInContext(ctx);
const QW = sandbox.QW;

const modOrder = [];
for (const g of QW.groups) for (const m of g.ms) if (m !== 'atlas' && m !== 'atlas2') modOrder.push([g.n, m]);

const prio = (f) => f.tags.includes('核心') ? 'P0' : ((f.tags.includes('AI') || f.tags.includes('创新')) ? 'P2' : 'P1');
const total = QW.totalCount(); const panelTotal = QW.panelCount(); const subTotal = QW.subCount();
const L = [];
const p = (s = '') => L.push(s);

p('# QuantLab Pro · 投研平台功能说明书');
p('');
p('> 本文档与网页原型 `index.html` 由**同一份功能注册表**生成（`assets/js/registry/*.js`），编号、名称、指标与说明完全一致。');
p('> 原型只做**界面与功能展示**，图表均为示意数据，不含任何真实算法实现；本文档的「算法实现要点」即后续开发的技术选型清单。');
p('');
p('## 0. 总览');
p('');
p('| 项目 | 数量 |');
p('| --- | --- |');
p(`| 功能总数（功能面板 + 子功能） | **${total}** |`);
p(`| 功能面板（卡片） | ${panelTotal} |`);
p(`| 子功能（细粒度功能点） | ${subTotal} |`);
p(`| 业务模块 | ${modOrder.length} |`);
p(`| P0 核心功能（平台骨架必备） | ${QW.features.filter(f => prio(f) === 'P0').length} |`);
p(`| P1 完整性功能 | ${QW.features.filter(f => prio(f) === 'P1').length} |`);
p(`| P2 AI / 创新差异化功能 | ${QW.features.filter(f => prio(f) === 'P2').length} |`);
p(`| 核心指标条目 | ${QW.features.reduce((a, f) => a + f.metrics.length, 0)} |`);
p(`| 算法实现要点条目 | ${QW.features.reduce((a, f) => a + f.algo.length, 0)} |`);
p(`| 功能间关联关系 | ${QW.features.reduce((a, f) => a + f.links.length, 0)} |`);
p('');
p('### 平台分层结构');
p('');
p('```');
p('┌─ 展示层 ── 投研工作台 · AI 智能中枢 · 智能体工厂 · AI工程治理 · 功能全景/子功能总表');
p('├─ 研究层 ── 自上而下：宏观 · 行业链 · 大类资产 · 全球外汇 · 主题投资 · 转型金融');
p('│           分资产：股票 · 固收 · 基金 · 期货CTA · 大宗商品 · 期权 · 利率外汇衍生品');
p('│           另类一级：PE/VC · REITs · 数字资产 · 结构化信贷 · 保险资管');
p('├─ 业务层 ── 财富管理/智能投顾 · 机构客户 · 做市与流动性提供');
p('├─ 引擎层 ── 多因子 → 策略回测 → 组合风控 → 交易执行/TCA → 监管科技');
p('└─ 底座层 ── 数据因子平台 · 平台工程 · 另类/ESG · 知识图谱 · 绩效报告');
p('```');
p('');
p('### 模块索引');
p('');
p('| 分组 | 模块 | 英文 | 功能数 | 定位 |');
p('| --- | --- | --- | --- | --- |');
let lastG = '';
for (const [gn, mid] of modOrder) {
  const m = QW.modules[mid], n = QW.panelCount(mid), ns = QW.subCount(mid);
  p(`| ${gn === lastG ? '' : gn} | **${m.n}** | ${m.sub} | ${n}+${ns} | ${md(m.desc.slice(0, 46))}… |`);
  lastG = gn;
}
p('');

// 全量功能索引表
p('## 1. 功能总表（速查）');
p('');
p('| 编号 | 功能名称 | 模块 | 子功能数 | 优先级 | 一句话说明 |');
p('| --- | --- | --- | --- | --- | --- |');
for (const [, mid] of modOrder) {
  for (const f of QW.features.filter(x => x.m === mid)) {
    p(`| \`${f.id}\` | ${md(f.n)} | ${QW.modules[mid].n} | ${f.subs.length} | ${prio(f)} | ${md(f.desc)} |`);
  }
}
p('');

// 分模块详述
p('## 2. 功能详述');
p('');
lastG = '';
let sec = 0;
for (const [gn, mid] of modOrder) {
  const m = QW.modules[mid];
  if (gn !== lastG) { p(`---`); p(''); p(`# 【${gn}】`); p(''); lastG = gn; }
  sec++;
  p(`## ${m.n}（${m.sub}）`);
  p('');
  p(`**模块定位**：${m.desc}`);
  p('');
  const kp = QW.kpis[mid] || [];
  if (kp.length) {
    p('**模块首屏关键指标（KPI 条）**：');
    p('');
    p('| 指标 | 示例值 | 说明 |');
    p('| --- | --- | --- |');
    for (const k of kp) p(`| ${md(k.k)} | ${md(k.v)} | ${md(k.d)} |`);
    p('');
  }
  for (const f of QW.features.filter(x => x.m === mid)) {
    p(`### ${f.id} ${f.n}`);
    p('');
    p(`- **优先级**：${prio(f)}　**标签**：${f.tags.join(' / ') || '常规'}　**页面栅格**：${f.w}/12`);
    p(`- **一句话定位**：${f.desc}`);
    p('');
    p(`**功能说明**`);
    p('');
    p(f.spec);
    p('');
    if (f.subs.length) {
      p(`**子功能（${f.subs.length} 项）**`);
      p('');
      p('| 编号 | 子功能 | 说明 | 标记 |');
      p('| --- | --- | --- | --- |');
      f.subs.forEach(sb => p(`| \`${sb.id}\` | ${md(sb.n)} | ${md(sb.d)} | ${sb.t ? md(sb.t) : ''} |`));
      p('');
    }
    p(`**核心指标（${f.metrics.length}）**：${f.metrics.map(x => '`' + x + '`').join('、')}`);
    p('');
    p(`**数据依赖**：${f.data.join('、')}`);
    p('');
    p('**算法实现要点（后续开发参考）**');
    p('');
    for (const a of f.algo) p(`- ${a}`);
    p('');
    p(`**输出与下游**：${f.out.join('、')}`);
    p('');
    if (f.links.length) {
      p(`**关联功能**：${f.links.map(id => `\`${id}\`${QW.byId[id] ? ' ' + QW.byId[id].n : ''}`).join('　·　')}`);
      p('');
    }
  }
}

// 附录
p('---');
p('');
p('# 附录');
p('');
p('## A. 实现路线建议');
p('');
p('平台建议分四期落地，每期都能独立交付可用价值：');
p('');
p('| 阶段 | 目标 | 建议范围 | 关键前置 |');
p('| --- | --- | --- | --- |');
p('| 一期（数据底座） | 让数据可信 | `DAT-01`~`DAT-07` 全部 + `EQ-01/02`、`MAC-01` | PIT 时点库与数据质量监控必须先做，否则后续所有回测结论不可靠 |');
p('| 二期（研究能力） | 让研究可复用 | 各资产模块 P0 功能 + `FAC-01`~`FAC-04`、`KNO-01` | 语义层与因子治理先行 |');
p('| 三期（策略与组合） | 让结论可执行 | `STR-01`~`STR-08`、`PORT-01`~`PORT-07`、`EXE-01`~`EXE-04` | 依赖二期因子与风险模型 |');
p('| 四期（AI 与创新） | 让效率倍增 | `AI-*`、`AGT-*`、`AIO-*`、`FAC-10`、`STR-06`、`KNO-05`、`REP-07` | 必须先有 `AI-12`/`AIO-07` 治理层再放开生成能力 |');
p('| 五期（业务与合规扩展） | 覆盖完整经营 | `WL-*` 财富、`CLI-*` 机构客户、`MM-*` 做市、`RGT-*` 监管科技 | 依赖一至三期数据、风控与交易底座 |');
p('| 六期（另类资产） | 扩展可投资产边界 | `PRI-*` 一级、`REI-*` REITs、`CRY-*` 数字资产、`CRD-*` 结构化、`INS-*` 保险、`SUS-*` 转型金融、`RT-*` 利率外汇衍生品、`TH-*` 主题 | 数据可得性与合规许可为前置条件 |');
p('');
p('## B. P0 核心功能清单（' + QW.features.filter(f => prio(f) === 'P0').length + ' 项）');
p('');
p('| 编号 | 名称 | 模块 |');
p('| --- | --- | --- |');
for (const f of QW.features.filter(f => prio(f) === 'P0')) p(`| \`${f.id}\` | ${f.n} | ${QW.modules[f.m].n} |`);
p('');
{
  const aiPanels = QW.features.filter(f => prio(f) === 'P2');
  let aiSubs = 0;
  QW.features.forEach(f => f.subs.forEach(sb => { if (sb.t) aiSubs++; }));
  p('## C. AI 与创新功能清单（' + (aiPanels.length + aiSubs) + ' 项：面板 ' + aiPanels.length + ' + AI 子功能 ' + aiSubs + '）');
  p('');
  p('### C.1 AI / 创新功能面板');
  p('');
  p('| 编号 | 名称 | 模块 | 创新点 |');
  p('| --- | --- | --- | --- |');
  for (const f of aiPanels) p(`| \`${f.id}\` | ${md(f.n)} | ${QW.modules[f.m].n} | ${md(f.desc)} |`);
  p('');
  p('### C.2 含 AI 标记的子功能（按面板）');
  p('');
  p('| 所属面板 | 子功能 | 说明 |');
  p('| --- | --- | --- |');
  QW.features.forEach(f => f.subs.forEach(sb => { if (sb.t) p(`| \`${f.id}\` ${md(f.n)} | ${md(sb.n)} | ${md(sb.d)} |`); }));
}
p('');
p('## D. 功能关联图（谁依赖谁）');
p('');
p('功能之间的关联关系共 ' + QW.features.reduce((a, f) => a + f.links.length, 0) + ' 条，被引用最多的功能是平台的「枢纽节点」，应优先保证其稳定性与接口规范：');
p('');
const inbound = {};
for (const f of QW.features) for (const l of f.links) inbound[l] = (inbound[l] || 0) + 1;
const hubs = Object.entries(inbound).sort((a, b) => b[1] - a[1]).slice(0, 20);
p('| 被引用次数 | 编号 | 名称 | 模块 |');
p('| --- | --- | --- | --- |');
for (const [id, n] of hubs) {
  const f = QW.byId[id];
  p(`| ${n} | \`${id}\` | ${f ? f.n : '-'} | ${f ? QW.modules[f.m].n : '-'} |`);
}
p('');
p('## E. 指标口径注意事项（通用约定）');
p('');
p('- **时点原则**：一切历史分析必须使用 `DAT-03` 的 PIT 视图，财务数据以**公告日**而非报告期入库，避免前视偏差。');
p('- **复权原则**：收益计算使用后复权价格 + 分红再投资；展示价格用不复权，两者不可混用。');
p('- **涨跌颜色**：全平台遵循 A 股习惯，**红涨绿跌**。');
p('- **口径唯一性**：同名指标只允许一个口径定义（见 `DAT-02`），变更走审批并触发 `DAT-04` 影响分析。');
p('- **过拟合纪律**：任何策略上线前必须通过 `STR-06` 的 PBO / Deflated Sharpe 闸门，并登记试验次数。');
p('- **AI 输出纪律**：AI 生成的任何数字必须能在数据源复现（`AI-12`），否则不得进入报告。');
p('');
p('---');
p('');
p(`*本文档由 \`tools/gen-docs.mjs\` 自动生成，共 ${total} 项功能。修改功能请编辑 \`assets/js/registry/*.js\` 后重新运行生成脚本，网页与文档同步更新。*`);

// 表格单元格转义：竖线会破坏 Markdown 表格；HTML 实体还原为字符
function md(s) { return String(s == null ? '' : s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\|/g, '\\|'); }

fs.writeFileSync(path.join(root, 'FUNCTIONS.md'), L.join('\n') + '\n');
console.log('✅ FUNCTIONS.md 已生成：', L.length, '行 /', (L.join('\n').length / 1024).toFixed(1), 'KB /', total, '项功能');
