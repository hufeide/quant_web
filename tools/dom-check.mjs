// tools/dom-check.mjs — 用最小 DOM 桩运行 app.js，遍历所有模块与功能抽屉，捕获运行时错误
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const load = (f) => fs.readFileSync(path.join(root, f), 'utf8');

function El(id) {
  const e = {
    id, innerHTML: '', value: '', style: {}, onclick: null,
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, toggle(c, v) { v ? this.add(c) : this.remove(c); }, contains(c) { return this._s.has(c); } },
    addEventListener() { }, getAttribute() { return null; },
    querySelector: () => null, querySelectorAll: () => [], closest: () => null
  };
  return e;
}
const els = {};
for (const id of ['ticker', 'side', 'main', 'q', 'sugg', 'mask', 'drawer', 'dh', 'db']) els['#' + id] = El(id);

const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.location = { hash: '#/m/home' };
sandbox.history = { replaceState() { } };
const listeners = {};
sandbox.document = {
  readyState: 'complete',
  querySelector: (s) => els[s] || null,
  querySelectorAll: () => [],
  addEventListener() { }
};
sandbox.addEventListener = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };

const ctx = vm.createContext(sandbox);
for (const f of [
  'assets/js/chartlib.js', 'assets/js/registry/00-core.js', 'assets/js/registry/10-home-ai.js',
  'assets/js/registry/20-macro-industry.js', 'assets/js/registry/30-allocation-overseas.js',
  'assets/js/registry/40-equity.js', 'assets/js/registry/45-bond-fund.js',
  'assets/js/registry/50-futures-commodity-options.js', 'assets/js/registry/60-factor-strategy.js',
  'assets/js/registry/70-portfolio-execution.js', 'assets/js/registry/80-data-alt-knowledge-report.js',
  'assets/js/app.js'
]) new vm.Script(load(f), { filename: f }).runInContext(ctx);

const QW = sandbox.QW;
let bad = [];
const sizes = {};

// init() 已在加载时运行 -> 默认渲染 home
const homeHTML = els['#main'].innerHTML;
if (!homeHTML || homeHTML.length < 2000) bad.push('首页渲染内容过短: ' + homeHTML.length);
if (!/HOME-01/.test(homeHTML)) bad.push('首页缺少 HOME-01 卡片');
if (!/class="kpi/.test(homeHTML)) bad.push('首页缺少 KPI');
if (!/<svg/.test(homeHTML)) bad.push('首页缺少 SVG 图表');
sizes.home = homeHTML.length;

// 通过 hashchange 监听器逐个渲染所有模块
const fire = () => (listeners.hashchange || []).forEach(fn => fn());
for (const mid of Object.keys(QW.modules)) {
  sandbox.location.hash = '#/m/' + mid;
  els['#main'].innerHTML = '';
  try { fire(); } catch (e) { bad.push(`模块 ${mid} 渲染抛错: ${e.message}`); continue; }
  const h = els['#main'].innerHTML;
  sizes[mid] = h.length;
  if (h.length < 1500) bad.push(`模块 ${mid} 渲染内容过短: ${h.length}`);
  if (mid !== 'atlas' && !/<svg|class="dt"|class="lst"|class="chat"/.test(h)) bad.push(`模块 ${mid} 无可视化内容`);
  if (/undefined|NaN/.test(h)) bad.push(`模块 ${mid} HTML 含 undefined/NaN`);
}

// 通过 hash 路由逐个打开所有功能抽屉
for (const f of QW.features) {
  sandbox.location.hash = '#/f/' + f.id;
  els['#db'].innerHTML = ''; els['#dh'].innerHTML = '';
  try { fire(); } catch (e) { bad.push(`${f.id} 抽屉抛错: ${e.message}`); continue; }
  const d = els['#db'].innerHTML, dh = els['#dh'].innerHTML;
  if (!dh.includes(f.id)) bad.push(`${f.id} 抽屉标题未渲染`);
  if (d.length < 600) bad.push(`${f.id} 抽屉内容过短: ${d.length}`);
  if (!/算法实现要点/.test(d)) bad.push(`${f.id} 抽屉缺少算法要点`);
  if (/undefined|NaN/.test(d)) bad.push(`${f.id} 抽屉含 undefined/NaN`);
}

const sideHTML = els['#side'].innerHTML;
for (const mid of Object.keys(QW.modules)) {
  if (!sideHTML.includes('data-m="' + mid + '"')) bad.push('侧栏缺少模块: ' + mid);
}
const tickerHTML = els['#ticker'].innerHTML;
if (!/track/.test(tickerHTML)) bad.push('跑马灯未渲染');

// 逐个功能打开抽屉（通过 hash 路由 -> 需要 route，改用 window 上暴露的方式：模拟点击不可行，
// 因此这里复用 QW 数据直接校验抽屉所需字段齐全，并检查 app.js 中 openDrawer 依赖的键）
for (const f of QW.features) {
  for (const k of ['id', 'n', 'desc', 'spec', 'metrics', 'data', 'algo', 'out', 'links', 'tags', 'w', 'm']) {
    if (f[k] === undefined) bad.push(`${f.id} 缺字段 ${k}`);
  }
  if (![3, 4, 6, 8, 12].includes(f.w)) bad.push(`${f.id} 栅格宽度非法: ${f.w}`);
  if (f.desc.length > 60) bad.push(`${f.id} desc 过长(${f.desc.length})，卡片内易折行`);
  if (f.n.length > 24) bad.push(`${f.id} 名称过长(${f.n.length})`);
}

console.log('渲染字节数:', JSON.stringify(sizes));
console.log('侧栏:', sideHTML.length, '| 跑马灯:', tickerHTML.length);
if (bad.length) { console.error('❌ ' + bad.length + ' 项问题:\n' + bad.join('\n')); process.exit(1); }
console.log('✅ DOM 渲染路径检查通过');
