// tools/e2e-check.mjs — 端到端闸门：装配完整性（index.html 引入、文档同步、数量一致）
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const regDir = path.join(root, 'assets/js/registry');
const regFiles = fs.readdirSync(regDir).filter(f => f.endsWith('.js')).sort();
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

const bad = [];

// 1. index.html 必须引用每一个注册表文件
for (const f of regFiles) {
  if (!html.includes('registry/' + f)) bad.push('index.html 未引入 ' + f);
}

// 2. 注册表可加载并统计
const sandbox = { console };
sandbox.window = sandbox; sandbox.globalThis = sandbox;
const ctx = vm.createContext(sandbox);
for (const f of ['assets/js/chartlib.js', ...regFiles.map(f => 'assets/js/registry/' + f)]) {
  new vm.Script(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f }).runInContext(ctx);
}
const QW = sandbox.QW;
const total = QW.totalCount(), panels = QW.panelCount(), subs = QW.subCount();
const mods = Object.keys(QW.modules).filter(k => k !== 'atlas' && k !== 'atlas2').length;

// 3. README 数量与实际一致
const need = [
  [`**${total} 项功能**`, 'README 缺少功能总数 ' + total],
  [`${panels} 个功能面板`, 'README 缺少面板数 ' + panels],
  [`${subs} 项子功能`, 'README 缺少子功能数 ' + subs],
  [`${mods} 个业务模块`, 'README 缺少模块数 ' + mods]
];
for (const [s, msg] of need) if (!readme.includes(s)) bad.push(msg);

// 4. FUNCTIONS.md 不早于任一注册表文件（说明文档已随源码重新生成）
const docPath = path.join(root, 'FUNCTIONS.md');
if (!fs.existsSync(docPath)) bad.push('FUNCTIONS.md 不存在');
else {
  const docM = fs.statSync(docPath).mtimeMs;
  const newest = Math.max(...regFiles.map(f => fs.statSync(path.join(regDir, f)).mtimeMs));
  if (docM < newest) bad.push('FUNCTIONS.md 早于注册表文件，需重新生成');
  const doc = fs.readFileSync(docPath, 'utf8');
  for (const m of Object.keys(QW.modules)) {
    if (m === 'atlas' || m === 'atlas2') continue;
    if (!doc.includes(QW.modules[m].n)) bad.push('FUNCTIONS.md 缺少模块 ' + m);
  }
}

// 5. 侧栏分组覆盖全部模块（否则模块不可达）
const grouped = new Set();
for (const g of QW.groups) for (const m of g.ms) grouped.add(m);
for (const m of Object.keys(QW.modules)) if (!grouped.has(m)) bad.push('分组未覆盖模块 ' + m);

console.log(`端到端：注册表文件 ${regFiles.length} 个 | 模块 ${mods} | 面板 ${panels} | 子功能 ${subs} | 功能 ${total}`);
if (bad.length) { console.error('❌ 问题 ' + bad.length + ':\n' + bad.slice(0, 20).join('\n')); process.exit(1); }
console.log('✅ 端到端闸门通过');
