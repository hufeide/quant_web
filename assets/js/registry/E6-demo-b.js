/* registry/E6-demo-b.js — AI 实演中心（中）：
   全局搜索 / 自动研究工厂 / 因子挖掘 / 财报夜 / 反事实 / 大跌陪伴 */
(function (g) {
  'use strict';
  var QW = g.QW, F = QW.F;

  F({
    id: 'DEM-05', m: 'demo', n: '样例：全局搜索一站式', w: 6, tags: ['AI', '核心'],
    desc: '同一搜索框同时找到功能、指标、标的与研报，并可直接追问。',
    spec: '演示全局搜索：输入关键词混合返回平台功能、指标定义、公司与研报，点击功能直达模块，自然语言问题直接交给 AI 编排，展示"搜索→结果→执行"的一体化体验。',
    metrics: ['混合结果', '直达功能', '语义匹配', '追问执行'],
    data: ['功能注册表', '指标字典', '证券主数据'], algo: ['语义检索（示意）'], out: ['搜索结果'],
    links: ['AI-01', 'WB-03', 'DAT-02'],
    subs: ['功能/指标/标的混排', '快捷键唤起', '结果分组', '直接执行', '指标口径卡', '最近使用'],
    viz: function () {
      return {
        k: 'demo', scenario: '全局搜索 · / 唤起',
        placeholder: '试试输入：基差、宁德、ROE 怎么算、帮我筛…',
        start: 'tip',
        nodes: {
          tip: {
            html: '按 <code>/</code> 随时唤起搜索。它能同时找<b>功能、指标、公司、基金、研报</b>，自然语言问题会直接进入 AI 编排。试试：',
            chips: [{ t: '基差', to: 'basis' }, { t: 'ROE 摊薄和加权有什么区别？', to: 'roe' }, { t: '贵州茅台', to: 'stock' }, { t: '帮我找低估的银行股', to: 'nl' }]
          },
          basis: {
            html: '<b>「基差」找到 26 项</b>，分组展示：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">⚙</span><div><b>功能（8）</b><br><span>FUT-01 基差全景看板 · FUT-02 展期收益 · BND-05 利差曲面 · RT-03 跨币种基差…</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">∑</span><div><b>指标（6）</b><br><span>年化基差率 · 基差 z 值 · 基差半衰期 · 季节性基差…</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">▤</span><div><b>面板（12）</b><br><span>螺纹钢基差当前 -1.8%（12% 分位）…</span></div></div></div>',
            chips: [{ t: '打开 FUT-01', to: 'open' }, { t: '基差异常说明什么？', to: 'ask' }]
          },
          roe: {
            html: '<b>ROE（净资产收益率）</b>口径卡片：<div class="demo-cardgrid">' +
              '<div class="demo-kpi"><div class="k">摊薄 ROE</div><div class="v" style="font-size:12px">归母净利/期末净资产</div></div>' +
              '<div class="demo-kpi"><div class="k">加权 ROE</div><div class="v" style="font-size:12px">按时间加权平均</div></div>' +
              '<div class="demo-kpi"><div class="k">扣非 ROE</div><div class="v" style="font-size:12px">剔除非经常损益</div></div></div>' +
              '<b>常见误用</b>：①高杠杆行业 ROE 高但风险大，需结合负债率；②增发摊薄会压低期末口径；③一次性收益会虚增，建议看扣非。',
            chips: [{ t: '用扣非 ROE 连续 3 年选股', to: 'nl' }, { t: '贵州茅台', to: 'stock' }]
          },
          stock: {
            html: '<b>贵州茅台 600519</b> 统一实体卡（Golden ID：SH600519）：<div class="demo-cardgrid">' +
              '<div class="demo-kpi"><div class="k">最新价</div><div class="v up">1,842</div></div>' +
              '<div class="demo-kpi"><div class="k">PE 分位</div><div class="v">22%</div></div>' +
              '<div class="demo-kpi"><div class="k">孪生健康</div><div class="v up">86</div></div>' +
              '<div class="demo-kpi"><div class="k">论点健康</div><div class="v">持有</div></div></div>' +
              '可直达：个股全景(EQ-01) · 估值(EQ-05) · 机会卡(DEC-02) · 事件时间线。',
            chips: [{ t: '现在值得加仓吗？', to: 'ask' }, { t: '帮我找低估的银行股', to: 'nl' }]
          },
          nl: {
            html: '识别为<b>自然语言取数任务</b>，已转交 AI-01：理解为「PB 处历史 30% 分位以下、近 4 季度盈利为正的银行」。<b>命中 6 只</b>：招商银行、成都银行、江苏银行、宁波银行、邮储银行、南京银行（示意）。',
            verdict: ['wait', '我先按上述口径查询；需要改为股息率口径，或加入"不良率&lt;1.2%"条件吗？'],
            chips: [{ t: '加入不良率条件', to: 'refine' }, { t: '每天自动更新', to: 'task' }]
          },
          refine: { html: '条件已增加 <code>不良贷款率 &lt; 1.2%</code>，命中收窄至 4 只；结果同时给出拨备覆盖率对照。', chips: [{ t: '每天自动更新', to: 'task' }] },
          task: { html: '已保存为每日盘后任务，新进/退出名单自动推送。', verdict: ['go', '<b class="up">已创建</b> · 搜索框的一句话变成了持续运行的自动化。'] },
          open: { html: '已为你打开 <code>FUT-01 合约基差全景看板</code>（真实环境中跳转模块页）。', chips: [{ t: '基差异常说明什么？', to: 'ask' }] },
          ask: {
            html: '基差快速走弱（期货大幅贴水）通常意味三种可能：①现货承压、产业套保盘增加；②市场对远期悲观；③临近交割的流动性扰动。我会结合<b>库存分位、仓单、席位持仓</b>判断是机会还是风险，并在 ANM-04 衍生品异常中实时标记。',
            chips: [{ t: '螺纹钢基差异常说明什么？', to: 'basis' }]
          }
        },
        routes: [
          { kw: ['基差'], to: 'basis' },
          { kw: ['ROE', 'roe'], to: 'roe' },
          { kw: ['茅台'], to: 'stock' },
          { kw: ['选', '找', '低估'], to: 'nl' },
          { kw: ['打开'], to: 'open' }
        ]
      };
    }
  });

  F({
    id: 'DEM-06', m: 'demo', n: '样例：AI 自动研究工厂', w: 6, tags: ['AI', '创新'],
    desc: '一个课题从自动提问、找反例到过拟合闸门的无人值守过程。',
    spec: '演示 RSP 自动研究闭环：系统从异常信号立项，自动生成竞争假设、定向找反例、取数做因子、回测、过拟合闸门，研究员只在关键节点接管。',
    metrics: ['自动进度', '假设存活', '闸门结论', '人工节点'],
    data: ['研究流水线'], algo: ['自动编排（示意）'], out: ['研究结论'],
    links: ['RSP-01', 'RSP-07', 'AIP-06'],
    subs: ['异常立项', '多假设竞争', '反例压力', '自动回测', 'PBO 闸门', '成文跟踪'],
    viz: function () {
      return {
        k: 'demo', scenario: 'RSP · 自动研究工厂',
        placeholder: '输入一个研究课题，看 AI 自动完成…',
        start: 'q',
        nodes: {
          q: {
            html: '给我一个研究问题，我自动立项、找反例、做因子回测（<b>点下面的问法即可</b>）：',
            chips: [
              { t: '研究一下：存储芯片涨价能不能传导成 A 股相关公司的利润？', to: 'p1' },
              { t: '过拟合闸门结果呢？', to: 'p4' },
              { t: '生成研究报告', to: 'p5' }
            ]
          },
          p1: {
            html: '已立项并自动拆解，<b>生成 3 个相互竞争的假设</b>：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">H1</span><div><b>成本推动型</b><br><span>涨价主要被上游拿走，封测/模组毛利被压缩</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">H2</span><div><b>需求拉动型</b><br><span>AI 服务器需求驱动，设计公司量价齐升（看多）</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">H3</span><div><b>库存周期型</b><br><span>涨价只是补库，2 个季度后回吐</span></div></div></div>',
            auto: 'p2'
          },
          p2: {
            html: '<b>反例引擎工作中</b>（Critic 有一票否决权）：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">✗</span><div><b>找到 H2 反例 1</b><br><span>2021 年涨价周期中设计公司利润弹性滞后 2 季度</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">✗</span><div><b>找到 H2 反例 2</b><br><span>当前渠道库存已处 72% 分位，非纯缺货</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">✓</span><div><b>H2 部分存活</b><br><span>HBM/企业级 SSD 细分仍供不应求，消费级不支持</span></div></div></div>',
            chips: [{ t: '继续自动做因子和回测', to: 'p3' }, { t: '人工接管：我要补充调研', to: 'human' }]
          },
          human: { html: '已暂停流水线并把 2 条反例、3 个待验证问题写入调研清单（KNO-04），你完成调研后可从断点继续。', chips: [{ t: '调研完成，继续', to: 'p3' }] },
          p3: {
            html: '自动完成取数→因子→回测（14 分钟）：',
            kpis: [
              { k: '候选因子', v: '37 → 4', c: '' },
              { k: 'HBM 细分 IC', v: '0.071', c: 'up' },
              { k: '消费级 IC', v: '0.012', c: 'dn' },
              { k: '样本外夏普', v: '1.3', c: 'up' }
            ],
            chart: {
              k: 'scatter', height: 210, n: 48, seed: 'DEM06f',
              xc: .04, xs: .03, b: 13, a: .1, e: .45
            },
            chips: [{ t: '过拟合闸门结果呢？', to: 'p4' }]
          },
          p4: {
            html: '<b>统计闸门结果（不可绕过）</b>：<div class="demo-cardgrid">' +
              '<div class="demo-kpi"><div class="k">PBO</div><div class="v dn">0.21</div></div>' +
              '<div class="demo-kpi"><div class="k">Deflated SR</div><div class="v up">1.18</div></div>' +
              '<div class="demo-kpi"><div class="k">试验次数</div><div class="v" style="font-size:12px">142（已惩罚）</div></div>' +
              '<div class="demo-kpi"><div class="k">容量估计</div><div class="v" style="font-size:12px">¥3.8 亿</div></div></div>',
            chart: {
              k: 'gauge', height: 185, value: .21, label: 'PBO 0.21', sub: '过拟合概率 · 远低于 0.5 拒绝线'
            },
            verdict: ['go', '<b class="up">闸门通过（有条件）</b>：仅限 HBM/企业级 SSD 细分；建议仓位 ≤2%、持有 1-2 季度；PBO 0.21 偏低但未到 0.5 拒绝线。已生成研究初稿 DEC-04 论点对象，等待投委会评审。'],
            chips: [{ t: '生成研究报告', to: 'p5' }]
          },
          p5: { html: '报告已生成（10 段式，含 8 张图表），并创建监控：<code>渠道库存分位 &gt; 85%</code> 或 <code>HBM 现货价连续 4 周下跌</code> 时自动标记论点失效并通知你。', verdict: ['go', '<b class="up">闭环完成</b>：问题→假设→反例→因子→闸门→论点→监控，全程 41 分钟，人工仅介入 1 次。'] }
        },
        routes: [
          { kw: ['闸门', 'PBO'], to: 'p4' },
          { kw: ['因子', '回测'], to: 'p3' },
          { kw: ['报告'], to: 'p5' },
          { kw: ['人工', '接管'], to: 'human' }
        ]
      };
    }
  });

  F({
    id: 'DEM-07', m: 'demo', n: '样例：对话式挖因子', w: 6, tags: ['AI'],
    desc: '用自然语言提出因子想法，AI 生成表达式、解释经济含义并出检验报告。',
    spec: '演示 AI-06 因子工厂：从一句经济学假设到可回测表达式，自动完成 IC、分层、换手、与存量因子相关性检验，并决定入库或淘汰。',
    metrics: ['表达式', 'IC/ICIR', '增量解释', '入库结论'],
    data: ['量价/财务库'], algo: ['符号生成+检验（示意）'], out: ['因子卡'],
    links: ['AI-06', 'FAC-02', 'RSP-04'],
    subs: ['假设表达', '表达式生成', '经济含义', '检验报告', '冗余检查', '因子卡'],
    viz: function () {
      return {
        k: 'demo', scenario: 'AI-06 · 对话式因子挖掘',
        placeholder: '描述你的因子想法…',
        start: 'q',
        nodes: {
          q: {
            html: '把你的想法说成一句话，我替你写成因子表达式并检验（<b>点击出结果</b>）：',
            chips: [
              { t: '被分析师密集上调预期、但股价还没动的股票会补涨，能做成因子吗？', to: 'gen' },
              { t: '直接看 IC / 换手检验结果', to: 'res' },
              { t: '它和动量因子重复吗？', to: 'corr' },
              { t: '检验通过能入库吗？', to: 'pass' }
            ]
          },
          gen: {
            html: '可以，这是经典的<b>"预期修正-价格滞后"</b>逻辑。我生成表达式并做了行业市值中性化：<br><br>' +
              '<code>f = z(rank(ΔEPS_consensus_3M / price)) − β₁·z(ret_60d) − β₂·z(size) − β₃·z(industry)</code><div class="demo-src"><span>含义</span>：预期上修强度剔除已经涨过的部分与行业市值影响</div>',
            chips: [{ t: '检验结果怎么样？', to: 'res' }, { t: '它和动量因子重复吗？', to: 'corr' }]
          },
          res: {
            html: '<b>标准检验（2018-2025，月频，PIT 口径）</b>',
            kpis: [
              { k: 'Rank IC', v: '0.064', c: 'up' },
              { k: 'ICIR', v: '1.18', c: 'up' },
              { k: '多空年化', v: '+9.4%', c: 'up' },
              { k: '月换手', v: '38%', c: '' },
              { k: '成本后夏普', v: '1.02', c: 'up' },
              { k: '单调性', v: '通过', c: 'up' }
            ],
            chart: {
              k: 'line', height: 210, n: 90, start: 1, vol: .008, drift: .0009,
              names: ['多空组合', '基准'], mean: 1, gap: .18, sd: .003,
              title: '因子多空净值（样本外）'
            },
            chips: [{ t: '它和动量因子重复吗？', to: 'corr' }, { t: '能入库吗？', to: 'pass' }]
          },
          corr: {
            html: '与存量 3,842 个因子比对：与<b>修正动量因子相关 0.61（偏高）</b>，但控制该因子后增量 IC 仍有 <b>0.028，t=2.7</b>；与 SUE、质量因子相关 &lt;0.3。<br>处理建议：作为"预期修正因子族"的增强版本入库，与原因子做集成而非并列使用。',
            chips: [{ t: '能入库吗？', to: 'pass' }]
          },
          pass: {
            html: '已生成因子卡 <code>#F-2031 预期修正滞后</code>：通过 IC、换手、成本、冗余、多重检验五道门，<b>建议入库为观察因子</b>，先模拟 3 个月再决定是否进模型；同时生成 8 个变体（1M/3M/6M 窗口）供后续比较。',
            verdict: ['go', '<b class="up">入库（观察）</b> · 从一句话到可评审因子卡，全程 6 分钟；经济假设、表达式、检验证据全部留痕。']
          }
        },
        routes: [{ kw: ['检验', '结果', 'IC'], to: 'res' }, { kw: ['重复', '相关', '动量'], to: 'corr' }, { kw: ['入库'], to: 'pass' }]
      };
    }
  });

  F({
    id: 'DEM-08', m: 'demo', n: '样例：财报夜三情景', w: 6, tags: ['AI'],
    desc: '持仓公司财报前自动生成牛/基/熊情景与组合损失估算。',
    spec: '演示 EQ-16/17：盘前聚合预期与期权隐含波动，模拟三种财报结果下个股与组合的损益，给出应对预案，盘后自动对照实际。',
    metrics: ['市场预期', '隐含波动', '组合损失', '应对预案'],
    data: ['一致预期', '期权 IV', '持仓'], algo: ['情景模拟（示意）'], out: ['财报预案'],
    links: ['EQ-16', 'WB-10', 'OPT-02'],
    subs: ['预期盘点', '三情景', '组合传导', '期权定价', '应对预案', '盘后对照'],
    viz: function () {
      return {
        k: 'demo', scenario: 'EQ-17 · 财报夜作战',
        placeholder: '输入：今晚某持仓发财报…',
        start: 'q',
        nodes: {
          q: {
            html: '财报/事件前告诉我你的敞口，我做盘前推演（<b>点击开始</b>）：',
            chips: [
              { t: '今晚英伟达发财报，相关 ETF 和算力链占我组合 11%，要提前做什么？', to: 'prep' },
              { t: '三种结果我各会怎样？', to: 'scen' },
              { t: '要不要先对冲？', to: 'hedge' }
            ]
          },
          prep: {
            html: '<b>盘前情报（财报 04:20 北京时间）</b><div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">预</span><div><b>一致预期</b><br><span>营收 302 亿 / EPS 0.82；指引区间 310-320 亿</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">σ</span><div><b>期权隐含单日波动 ±7.2%</b><br><span>IV 处近一年 78% 分位，期权偏贵</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">史</span><div><b>历史财报反应</b><br><span>近 8 次超预期后次日平均 +5.8%</span></div></div></div>',
            chips: [{ t: '三种结果我各会怎样？', to: 'scen' }]
          },
          scen: {
            html: '<b>三情景对个股 → 对你组合的传导</b>',
            table: '<div class="tw"><table class="dt"><thead><tr><th>情景</th><th>触发</th><th>NVDA</th><th>你的组合</th><th>概率</th></tr></thead><tbody>' +
              '<tr><td class="up">乐观</td><td>营收/指引双超</td><td class="up">+8%~+15%</td><td class="up">+1.6%</td><td>30%</td></tr>' +
              '<tr><td>中性</td><td>符合，指引平淡</td><td>-2%~+5%</td><td>+0.1%</td><td>48%</td></tr>' +
              '<tr><td class="dn">悲观</td><td>指引低于预期</td><td class="dn">-10%~-20%</td><td class="dn">-2.4%</td><td>22%</td></tr>' +
              '</tbody></table></div>',
            chart: {
              k: 'hist', height: 200, mean: .6, sd: 4.6, bins: 24, varLine: -7.2,
              varLabel: '期权隐含单日 ±7.2%', seed: 'DEM08'
            },
            verdict: ['wait', '期望损益为正（+0.4%），但悲观情景 -2.4% 会用掉你月度回撤预算的 30%。'],
            chips: [{ t: '我该对冲吗？', to: 'hedge' }, { t: '如果超预期要追吗？', to: 'chase' }]
          },
          hedge: {
            html: '三种选择对比：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">A</span><div><b>不动（推荐）</b><br><span>组合相关敞口仅 11% 且有债券对冲，期望损益为正</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">B</span><div><b>买看跌保护</b><br><span>成本约组合 0.3%，IV 偏贵，性价比一般</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">C</span><div><b>盘前减半</b><br><span>若乐观，损失约 +0.8% 上行；交易成本 0.15%</span></div></div></div>',
            chips: [{ t: '如果超预期要追吗？', to: 'chase' }, { t: '明天帮我对照预判', to: 'after' }]
          },
          chase: { html: '历史上超预期且 IV 高时，开盘追高的 5 日胜率仅 46%（期权已定价）。更稳妥是等回踩 5 日线或用财报后漂移（PEAD）分批参与；我会把"回踩不破缺口"设为提醒条件。', chips: [{ t: '明天帮我对照预判', to: 'after' }] },
          after: {
            html: '已设置明早自动任务：①对比实际 vs 三情景；②计算组合真实损益与预判偏差；③把结果记入你的<b>事件预判账本（DEC-11）</b>，长期统计你的财报判断准确率。',
            verdict: ['go', '<b class="up">已排程</b> · 事件前有预案、事件后有记分，这是事件驱动能力的积累方式。']
          }
        },
        routes: [{ kw: ['情景', '怎样'], to: 'scen' }, { kw: ['对冲'], to: 'hedge' }, { kw: ['追'], to: 'chase' }, { kw: ['明天', '对照'], to: 'after' }]
      };
    }
  });

  F({
    id: 'DEM-09', m: 'demo', n: '样例：反事实组合', w: 6, tags: ['AI', '创新'],
    desc: '"如果昨天没买它/降息 50bp"——即时重算组合并归因差异。',
    spec: '演示 AIC-05/PORT-12：持仓反事实与市场反事实两类问题，秒级重算 PnL、风险、回撤、暴露与 VaR，并把实际与最优可行决策的差距分解为时机、仓位、选股、执行损失。',
    metrics: ['反事实损益', '风险差异', '决策损失', '差异归因'],
    data: ['历史组合状态'], algo: ['状态重建（示意）'], out: ['反事实报告'],
    links: ['AIC-05', 'PORT-12', 'AI-08'],
    subs: ['持仓反事实', '市场反事实', '全风险重算', '最优可行', '损失分解', '经验入库'],
    viz: function () {
      return {
        k: 'demo', scenario: 'AIC-05 · 反事实引擎',
        placeholder: '如果…会怎样？',
        start: 'tip',
        nodes: {
          tip: {
            html: '可以问两类问题：<b>持仓反事实</b>（没买/少买/换标的）与<b>市场反事实</b>（降息、汇率、油价冲击）。试试：',
            chips: [{ t: '如果上周没买那只 AI 龙头？', to: 'hold' }, { t: '如果美联储意外降息 50bp？', to: 'macro' }]
          },
          hold: {
            html: '已重建上周决策时点的组合状态并重算至今：',
            kpis: [
              { k: '实际收益', v: '+2.1%', c: 'up' },
              { k: '反事实(不买)', v: '+1.0%', c: '' },
              { k: '差异', v: '+1.1%', c: 'up' },
              { k: '实际回撤', v: '-3.8%', c: '' }
            ],
            chart: {
              k: 'waterfall', height: 210,
              items: [
                { n: '反事实(不买)', v: 1.0, total: 1 },
                { n: '选股贡献', v: .75 }, { n: '时机贡献', v: .25 },
                { n: '对冲拖累', v: -.1 }, { n: '费用', v: -.05 }, { n: '实际收益', v: 2.1 }
              ],
              fy: function (v) { return v.toFixed(1) + '%'; }
            },
            verdict: ['go', '这笔决策贡献 <b class="up">+1.1%</b>，且期间最大回撤只增加 0.4pct——决策质量高。'],
            chips: [{ t: '如果当时只买一半呢？', to: 'half' }, { t: '如果美联储意外降息 50bp？', to: 'macro' }]
          },
          half: {
            html: '买一半：收益 <b>+1.55%</b>，回撤 <b>-3.5%</b>。边际分析显示第 2 批资金的风险调整贡献仍为正，当时加满的决策在数据上成立；但前提是你 10% 的回撤预算未被其他持仓占用。',
            chips: [{ t: '如果美联储意外降息 50bp？', to: 'macro' }]
          },
          macro: {
            html: '<b>市场反事实：美联储降息 50bp（超预期）</b>，经宏观-资产传导矩阵重算你的组合：',
            kpis: [
              { k: '组合当日', v: '+1.8%', c: 'up' },
              { k: '成长风格', v: '+3.1%', c: 'up' },
              { k: '利率债', v: '+0.9%', c: 'up' },
              { k: '黄金', v: '+1.4%', c: 'up' },
              { k: '美元敞口', v: '-0.7%', c: 'dn' },
              { k: 'VaR95 变化', v: '改善', c: 'up' }
            ],
            steps: [
              ['传导路径', '利率↓ → 成长估值↑ → 你的科技持仓受益；美元↓ → 未对冲海外资产折算受损'],
              ['净效应', '正贡献 +1.8%，但结构上美元现金是拖累项'],
              ['预案建议', '若担心该情景，可把美元现金转为短久期美债，保留降息弹性']
            ],
            chips: [{ t: '把这个教训记下来', to: 'learn' }]
          },
          learn: {
            html: '已写入决策经验库：<b>"大额美元现金在降息预期升温时是隐性空头"</b>，并关联到下次利率决议前的检查清单。反事实案例会用于训练 AI 执行与建议模型。',
            verdict: ['go', '<b class="up">已沉淀</b> · 每一次"如果当时"都变成下一次决策的输入。']
          }
        },
        routes: [{ kw: ['没买', '不买'], to: 'hold' }, { kw: ['一半'], to: 'half' }, { kw: ['降息', '美联储'], to: 'macro' }, { kw: ['记', '教训'], to: 'learn' }]
      };
    }
  });

  F({
    id: 'DEM-10', m: 'demo', n: '样例：大跌日陪伴', w: 6, tags: ['AI'],
    desc: '市场急跌时 AI 先做体检再安抚，用数据回答"要不要赎回"。',
    spec: '演示 WL-04 个人投资者陪伴：大跌触发时 AI 不渲染恐慌，而是检查用户目标进度、组合归因、历史情景与纪律信号，给出有数据支撑的行动建议。',
    metrics: ['情绪信号', '组合体检', '历史对照', '行动建议'],
    data: ['用户画像', '持仓', '历史情景'], algo: ['陪伴规则（示意）'], out: ['陪伴消息'],
    links: ['WL-04', 'HOME-07', 'PORT-05'],
    subs: ['主动触达', '盈亏归因', '目标影响', '历史类比', '纪律建议', '定投提示'],
    viz: function () {
      return {
        k: 'demo', scenario: 'WL-04 · 智能陪伴',
        placeholder: '今天跌这么多怎么办…',
        start: 'push',
        nodes: {
          push: {
            html: '📉 <b>14:35 主动推送</b>：今天沪深 300 下跌 3.1%，你的组合 -2.3%。先别着急操作，我帮你做了 30 秒体检：',
            auto: 'check'
          },
          check: {
            html: '<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">1</span><div><b>跌从哪来？</b><br><span>科技持仓 -3.6% 是主因；债券 +0.3%、黄金 +0.8% 起到缓冲——正是当初配置它们的作用</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">2</span><div><b>目标受影响吗？</b><br><span>你是 3 年养老目标，当前达成度 63%，按历史路径仍在正常区间内</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">3</span><div><b>基本面变了吗？</b><br><span>今日下跌主因海外情绪与资金面，你的持仓论点监控（DEC-05）<b>没有一条失效</b></span></div></div></div>',
            kpis: [{ k: '当前回撤', v: '-5.2%', c: '' }, { k: '回撤预算', v: '15%', c: 'up' }, { k: '论点健康', v: '84/100', c: 'up' }, { k: '历史同级别', v: '18次', c: '' }],
            chart: {
              k: 'line', height: 200, n: 70, start: 1, vol: .006, drift: .0006,
              names: ['我的账户', '目标路径下沿'], mean: 1, gap: .05, sd: .001,
              title: '账户净值仍在目标通道内（示意）'
            },
            chips: [{ t: '历史上这种跌法后来怎样？', to: 'hist' }, { t: '我想先卖掉一部分', to: 'sell' }, { t: '定投还要继续吗？', to: 'dca' }]
          },
          hist: {
            html: '过去 10 年类似"单日 -3%、基本面无恶化"出现 18 次：<b>3 个月后平均 +5.4%，12 个月后 15 次为正</b>。恐慌中卖出的投资者，平均比持有到期少赚 11%（示意统计）。但历史不保证未来，关键看你的钱是不是 3 年内要用。',
            chips: [{ t: '我想先卖掉一部分', to: 'sell' }, { t: '定投还要继续吗？', to: 'dca' }]
          },
          sell: {
            html: '理解你的感受。我们做个<b>冷静分析</b>而不是直接执行：①你的钱 3 年内不用；②卖出后要决定"什么时候买回来"，这需要连续做对两次；③如果只是降低焦虑，可以把权益从 58% 降到 52%（而非清仓），历史上这类微调对长期结果影响很小。要我按 52% 出一个分批方案吗？',
            verdict: ['wait', '系统不会在情绪高点鼓励清仓，但会尊重你的决定——方案会保留 30 分钟冷静期后才执行。'],
            chips: [{ t: '定投还要继续吗？', to: 'dca' }, { t: '那就先不动', to: 'hold' }]
          },
          dca: {
            html: '建议<b>继续</b>。今天你的定投金额实际买到的份额比上周多 3.1%；在目标进度正常、论点未失效时，下跌正是定投摊低成本的时段。我已把本周定投安排在明天收盘前执行。',
            chips: [{ t: '那就先不动', to: 'hold' }]
          },
          hold: {
            html: '好的，已记录"持有观察"。我会继续盯着：①任何持仓论点失效；②回撤接近 -10%；③出现流动性风险信号。有情况主动找你，没事不打扰。',
            verdict: ['go', '<b class="up">陪伴原则</b>：大跌时给数据与纪律，而不是跟着情绪行动。']
          }
        },
        routes: [{ kw: ['历史', '后来'], to: 'hist' }, { kw: ['卖', '赎回'], to: 'sell' }, { kw: ['定投'], to: 'dca' }, { kw: ['不动'], to: 'hold' }]
      };
    }
  });

})(window);
