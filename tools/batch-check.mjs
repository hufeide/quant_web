// tools/batch-check.mjs — 批量节点闸门：按模块统计"新增面板/子功能"并校验渲染
// 用法：
//   node tools/batch-check.mjs --self
//   node tools/batch-check.mjs --write-baseline
//   node tools/batch-check.mjs --file <注册表文件> --modules a,b,c --min-panels N --min-subs M
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const BASE = path.join(root, '.algl/baseline.json');

function loadRegistry() {
  const files = ['assets/js/chartlib.js',
    ...fs.readdirSync(path.join(root, 'assets/js/registry')).sort().map(f => 'assets/js/registry/' + f)];
  const sandbox = { console };
  sandbox.window = sandbox; sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  for (const f of files) new vm.Script(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f }).runInContext(ctx);
  return sandbox;
}

function counts(sandbox) {
  const QW = sandbox.QW, byMod = {};
  for (const m of Object.keys(QW.modules)) byMod[m] = { panels: 0, subs: 0 };
  for (const f of QW.features) {
    if (!byMod[f.m]) byMod[f.m] = { panels: 0, subs: 0 };
    byMod[f.m].panels += 1;
    byMod[f.m].subs += f.subs.length;
  }
  return byMod;
}

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };

if (argv.includes('--write-baseline')) {
  const sandbox = loadRegistry();
  fs.mkdirSync(path.dirname(BASE), { recursive: true });
  fs.writeFileSync(BASE, JSON.stringify({ modules: counts(sandbox), at: new Date().toISOString() }, null, 2));
  console.log('✅ 基线已写入 .algl/baseline.json');
  process.exit(0);
}

if (argv.includes('--self')) {
  const sandbox = loadRegistry();
  if (!sandbox.QW || !sandbox.QW.features.length) { console.error('--self 失败：注册表未加载'); process.exit(1); }
  console.log('✅ batch-check 自检通过（注册表可加载，面板 ' + sandbox.QW.features.length + '）');
  process.exit(0);
}

const file = flag('--file');
const mods = (flag('--modules', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const minPanels = +(flag('--min-panels', '0'));
const minSubs = +(flag('--min-subs', '0'));

if (!file || !mods.length) { console.error('用法：--file <文件> --modules a,b --min-panels N --min-subs M'); process.exit(1); }
if (!fs.existsSync(path.join(root, file))) { console.error('❌ 文件不存在: ' + file); process.exit(1); }
if (!fs.existsSync(BASE)) { console.error('❌ 基线不存在，请先运行 --write-baseline'); process.exit(1); }

const base = JSON.parse(fs.readFileSync(BASE, 'utf8')).modules;
const sandbox = loadRegistry();
const QW = sandbox.QW, MC = sandbox.MC;
const now = counts(sandbox);

let addP = 0, addS = 0, bad = [];
for (const m of mods) {
  const b = base[m] || { panels: 0, subs: 0 }, c = now[m] || { panels: 0, subs: 0 };
  addP += (c.panels - b.panels);
  addS += (c.subs - b.subs);
}
for (const f of QW.features.filter(x => mods.includes(x.m))) {
  let spec;
  try { spec = typeof f.viz === 'function' ? f.viz() : f.viz; }
  catch (e) { bad.push(`${f.id} viz() 抛错: ${e.message}`); continue; }
  if (!spec) { bad.push(`${f.id} 无 viz`); continue; }
  if (['html', 'demo'].includes(spec.k)) continue;
  let out;
  try { out = MC.render(spec); } catch (e) { bad.push(`${f.id} 渲染抛错: ${e.message}`); continue; }
  if (/mc-missing|渲染失败/.test(out)) bad.push(`${f.id} 渲染占位/失败`);
  if (/NaN|undefined|Infinity/.test(out)) bad.push(`${f.id} 输出含 NaN/undefined`);
  if (f.desc.length > 60) bad.push(`${f.id} desc 过长(${f.desc.length})`);
  if (f.n.length > 24) bad.push(`${f.id} 名称过长(${f.n.length})`);
  if (![3, 4, 6, 8, 12].includes(f.w)) bad.push(`${f.id} 栅格宽度非法`);
  for (const l of f.links) if (!QW.byId[l]) bad.push(`${f.id} 关联不存在: ${l}`);
}

console.log(`模块 ${mods.length} 个：新增面板 ${addP}（要求 ≥${minPanels}），新增子功能 ${addS}（要求 ≥${minSubs}）`);
if (bad.length) { console.error('❌ 问题 ' + bad.length + ':\n' + bad.slice(0, 20).join('\n')); process.exit(1); }
if (addP < minPanels || addS < minSubs) { console.error('❌ 增量不足'); process.exit(1); }
console.log('✅ 批量闸门通过');
