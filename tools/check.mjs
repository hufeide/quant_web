// tools/check.mjs — 语法检查 + 渲染自测 + 引用完整性校验
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const fs2 = fs;
const files = ['assets/js/chartlib.js',
  ...fs.readdirSync(path.join(root, 'assets/js/registry')).sort().map(f => 'assets/js/registry/' + f)];

const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
const ctx = vm.createContext(sandbox);

for (const f of files) {
  const code = fs.readFileSync(path.join(root, f), 'utf8');
  try { new vm.Script(code, { filename: f }).runInContext(ctx); }
  catch (e) { console.error('❌ 加载失败', f, e.message); process.exit(1); }
}
// app.js 仅做语法检查（需要 DOM）
new vm.Script(fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8'), { filename: 'app.js' });

const QW = sandbox.QW, MC = sandbox.MC;
let errs = [], warn = [], svgTotal = 0, kinds = {};

for (const f of QW.features) {
  for (const k of ['desc', 'spec']) if (!f[k] || f[k].length < 10) errs.push(`${f.id} 缺少 ${k}`);
  if (!f.subs.length) errs.push(`${f.id} 缺少子功能`);
  f.subs.forEach((sb, i) => {
    if (!sb.n || sb.n.length > 18) errs.push(`${sb.id} 子功能名称异常`);
    if (!sb.labelOnly && (!sb.d || sb.d.length < 6)) errs.push(`${sb.id} 子功能说明过短`);
    if (sb.n.length < 3) errs.push(`${sb.id} 子功能名称过短`);
    if (sb.id !== `${f.id}.${i+1}`) errs.push(`${sb.id} 编号不连续`);
  });
  for (const k of ['metrics', 'data', 'algo', 'out']) if (!f[k].length) errs.push(`${f.id} 缺少 ${k}`);
  if (!QW.modules[f.m]) errs.push(`${f.id} 模块无效: ${f.m}`);
  for (const l of f.links) if (!QW.byId[l]) errs.push(`${f.id} 关联功能不存在: ${l}`);
  let spec;
  try { spec = typeof f.viz === 'function' ? f.viz() : f.viz; }
  catch (e) { errs.push(`${f.id} viz() 抛错: ${e.message}`); continue; }
  if (!spec) { errs.push(`${f.id} 无 viz`); continue; }
  kinds[spec.k] = (kinds[spec.k] || 0) + 1;
  if (['html', 'demo'].includes(spec.k)) continue;
  let out;
  try { out = MC.render(spec); } catch (e) { errs.push(`${f.id} 渲染抛错: ${e.message}`); continue; }
  if (/mc-missing|渲染失败/.test(out)) errs.push(`${f.id} 渲染失败: ${out.slice(0, 120)}`);
  if (/NaN|undefined|Infinity/.test(out)) errs.push(`${f.id} SVG 含 NaN/undefined`);
  svgTotal += out.length;
}

// AI 实演中心：脚本节点引用完整性 + 节点配图真实可渲染（不允许出现图占位）
let demoNodes = 0, demoCharts = 0;
for (const f of QW.features) {
  let spec;
  try { spec = typeof f.viz === 'function' ? f.viz() : f.viz; } catch (e) { continue; }
  if (!spec) continue;
  if (spec.k === 'html') {
    if (/mc-missing|渲染失败/.test(spec.html)) errs.push(`${f.id} HTML 配图存在占位/失败`);
    if (/NaN|undefined|Infinity/.test(spec.html)) errs.push(`${f.id} HTML 配图含 NaN/undefined`);
    continue;
  }
  if (spec.k !== 'demo') continue;
  const nodes = spec.nodes || {};
  demoNodes += Object.keys(nodes).length;
  if (!nodes[spec.start]) errs.push(`${f.id} start 节点不存在: ${spec.start}`);
  for (const [id, node] of Object.entries(nodes)) {
    for (const c of (node.chips || [])) {
      if (c && c.to && !nodes[c.to]) errs.push(`${f.id}.${id} 推荐问法指向不存在节点: ${c.to}`);
    }
    if (node.auto && !nodes[node.auto]) errs.push(`${f.id}.${id} auto 指向不存在节点: ${node.auto}`);
    if (!node.chart) continue;
    if (['table', 'list', 'chat', 'html'].includes(node.chart.k)) continue;
    demoCharts++;
    let out;
    try { out = MC.render(node.chart); } catch (e) { errs.push(`${f.id}.${id} 配图渲染抛错: ${e.message}`); continue; }
    if (/mc-missing|渲染失败/.test(out)) errs.push(`${f.id}.${id} 配图渲染失败: ${out.slice(0, 140)}`);
    if (/NaN|undefined|Infinity/.test(out)) errs.push(`${f.id}.${id} 配图含 NaN/undefined`);
  }
  for (const r of (spec.routes || [])) {
    if (!nodes[r.to]) errs.push(`${f.id} 关键词路由指向不存在节点: ${r.to}`);
  }
}

// 模块覆盖
const byMod = {};
for (const f of QW.features) byMod[f.m] = (byMod[f.m] || 0) + 1;
for (const m of Object.keys(QW.modules)) if (!byMod[m] && m !== 'atlas') warn.push(`模块 ${m} 无功能`);
for (const m of Object.keys(QW.modules)) if (m !== 'atlas' && !QW.kpis[m]) warn.push(`模块 ${m} 无 KPI`);

// 栅格宽度合法性（实际排版由 app.js 的 layout() 按行填满，此处只校验基础宽度取值）
for (const f of QW.features) {
  if (![3, 4, 6, 8, 12].includes(f.w)) errs.push(`${f.id} 栅格基础宽度非法: ${f.w}`);
}

console.log('功能面板:', QW.features.length, '| 子功能:', QW.subCount(), '| 功能总数:', QW.totalCount());
console.log('模块数:', Object.keys(QW.modules).filter(k=>k!=='atlas'&&k!=='atlas2').length);
console.log('各模块功能数:', JSON.stringify(byMod));
console.log('图表类型分布:', JSON.stringify(kinds));
console.log('SVG 总字节:', svgTotal);
console.log('实演中心: 脚本节点', demoNodes, '| 节点配图', demoCharts);
console.log('核心:', QW.features.filter(f => f.tags.includes('核心')).length,
  '| AI/创新:', QW.features.filter(f => f.tags.includes('AI') || f.tags.includes('创新')).length,
  '| 指标条目:', QW.features.reduce((a, f) => a + f.metrics.length, 0),
  '| 算法要点:', QW.features.reduce((a, f) => a + f.algo.length, 0));
if (warn.length) console.log('\n⚠ 提示:\n' + warn.join('\n'));
if (errs.length) { console.error('\n❌ 错误 ' + errs.length + ':\n' + errs.join('\n')); process.exit(1); }
console.log('\n✅ 全部检查通过');
