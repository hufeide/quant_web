/* registry/E6-demo-a.js — AI 实演中心（上）
   可点击的具体样例：搜索取数 / 个股决策 / 技能流搭建 / 阅读即投资 / 全局搜索 */
(function (g) {
  'use strict';
  var QW = g.QW, F = QW.F, V = QW.V;

  QW.kpis.demo = [
    { k: '实演案例', v: '16 个', d: '覆盖搜索、研究、决策、风控、陪伴', c: '' },
    { k: '可点击追问', v: '120+', d: '每个案例含推荐问法分支', c: '' },
    { k: '平均串联模块', v: '4.6 个', d: '样例中跨模块调用', c: '' },
    { k: '演示数据', v: '预置', d: '无需配置，打开即演', c: 'g' },
    { k: '重放次数', v: '不限', d: '每个案例可反复重放', c: '' },
    { k: '算法实现', v: '0', d: '纯界面样例，不含真实计算', c: '' }
  ];

  F({
    id: 'DEM-00', m: 'demo', n: '实演中心使用指南', w: 12, tags: ['核心', 'AI'],
    desc: '所有样例都能像真实产品一样对话：点推荐问法或自己输入，AI 会分步演示。',
    spec: '实演中心把平台的搜索与 AI 能力做成 14 个"开箱即演"的完整案例。每个案例都是一段预置的多轮对话：用户提问后，AI 会展示理解的意图、调用的模块、分步过程与最终结果卡。你可以：①点击气泡下方推荐问法继续追问；②在输入框输入自己的问题（命中关键词会进入对应分支）；③点右上角"重放"重新观看；④看完后点"保存为技能流"体验从对话到自动化的转化。所有数字均为演示样例，不是真实行情或计算结果。',
    metrics: ['推荐问法', '分步过程', '结果卡片', '重放'],
    data: ['预置脚本', '演示数据'],
    algo: ['无算法（脚本化演示）'],
    out: ['可体验的交互样例'],
    links: ['DEM-01', 'FUS-01', 'WB-04'],
    subs: [
      '点击追问|点推荐气泡即可继续，无需自己输入',
      '自由输入|输入框支持关键词命中对应演示分支',
      '打字动效|AI 回复模拟真实思考延迟',
      '过程可见|每步展示调用了哪个平台模块',
      '结果四卡|结论、证据、情景、下一步标准结构',
      '一键转流程|满意样例可保存为技能流（示意）',
      '一键重放|每个案例可从头再看一遍',
      '纯演示声明|所有数字为样例数据'
    ],
    viz: function () {
      return {
        k: 'demo', scenario: '实演中心 · 使用指南',
        placeholder: '试试问：你们能演示什么？',
        start: 'open',
        nodes: {
          open: {
            html: '你好，我是 <b>QuantLab AI</b>。这里不是功能说明，而是<b>可以亲手点一遍的真实样例</b>。<br>' +
              '本模块 18 个案例覆盖：自然语言取数、个股加仓决策、一句话搭技能流、读文章找机会、全局搜索、自动研究工厂、对话挖因子、财报夜、反事实、大跌日陪伴、多空辩论、基金经理晨会、突发事件、CPI 解读、一键报告、技能沉淀，另加 22 种图表 × 场景的配图库。<br>' +
              '<b>怎么玩</b>：每个案例首屏都给了 2-3 个<b>可点问法</b>，点一下我就给出完整回答（过程 → 图表 → 结论 → 下一步）；也可以自己在输入框提问，命中关键词会进入对应分支。',
            chips: [{ t: '你们能演示什么？', to: 'what' }, { t: '数据是真的吗？', to: 'data' }, { t: '先带我看个股决策', to: 'goto' }]
          },
          what: {
            html: '每个案例我都会完整演四件事：<div class="demo-steps"><div class="demo-step"><span class="demo-stepdot">1</span><div><b>理解你的意图</b><br><span>识别实体、时间、口径，不确定会反问</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">2</span><div><b>自动编排模块</b><br><span>告诉你我调用了哪些平台功能</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">3</span><div><b>给出过程与证据</b><br><span>分步展示，数字都能溯源</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">4</span><div><b>输出结果与下一步</b><br><span>结论卡 + 三情景 + 可执行动作</span></div></div></div>',
            chips: [{ t: '数据是真的吗？', to: 'data' }, { t: '先带我看个股决策', to: 'goto' }]
          },
          data: {
            html: '本页<b>不含任何真实算法与行情计算</b>：所有对话、数字、图表都是为演示交互而预置的<b>样例脚本</b>，目的是让你直观感受"如果这个平台做出来，用起来是什么样"。',
            verdict: ['wait', '提示：真实产品中每个数字都会绑定数据源与计算版本，可点击溯源；本演示用固定样例代替。'],
            chips: [{ t: '先带我看个股决策', to: 'goto' }, { t: '看看自然语言取数', to: 'goto2' }]
          },
          goto: {
            html: '好，打开左侧 <code>DEM-02 个股加仓决策</code>，或在顶部搜索"加仓"。你也可以直接在这里问：<b>"贵州茅台现在能买吗"</b>，我会走一遍五模块联动分析。',
            chips: [{ t: '贵州茅台现在能买吗', to: 'data' }, { t: '看看自然语言取数', to: 'goto2' }]
          },
          goto2: {
            html: '请打开 <code>DEM-01 自然语言取数</code>，体验用一句话完成条件选股并生成定时任务。',
            chips: [{ t: '读文章也能找机会吗', to: 'data' }]
          }
        },
        routes: [
          { kw: ['个股', '加仓', '茅台', '买吗'], to: 'goto' },
          { kw: ['取数', '选股', 'SQL'], to: 'goto2' }
        ]
      };
    }
  });

  F({
    id: 'DEM-01', m: 'demo', n: '样例：自然语言取数', w: 6, tags: ['AI'],
    desc: '一句话描述选股条件，AI 确认口径、返回结果并转为每日任务。',
    spec: '演示 AI-01：用户用中文描述多条件选股需求，AI 解析实体与口径、展示理解结果、执行查询、给出命中列表，并把一次性查询保存为每日定时任务与指标预警的完整过程。',
    metrics: ['意图解析', '口径确认', '查询结果', '转任务'],
    data: ['财务 PIT 库', '一致预期'], algo: ['语义解析（示意）'], out: ['股票池', '定时任务'],
    links: ['AI-01', 'WB-03', 'EQ-12'],
    subs: ['口语化条件', '口径反问', '结果解释', '一键转定时', '阈值预警', 'SQL 对照'],
    viz: function () {
      return {
        k: 'demo', scenario: 'AI-01 · 自然语言取数',
        placeholder: '例如：近三年 ROE 都大于 15% 的消费股…',
        start: 'q',
        nodes: {
          q: {
            html: '可以这样问我（<b>点一下下面的问法就出完整结果</b>，也可以在输入框自己描述）：',
            chips: [
              { t: '帮我找连续三年 ROE>15%、负债率<50%、最近没怎么涨的大消费公司', to: 'understand' },
              { t: '直接看命中的 12 只结果（含表格与图）', to: 'result' },
              { t: 'ROE 为什么用扣非口径？', to: 'why' }
            ]
          },
          understand: {
            html: '我理解你的条件是：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">✓</span><div><b>ROE（摊薄）≥ 15%</b><br><span>2023/2024/2025 连续三年，口径：扣非归母</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">✓</span><div><b>资产负债率 &lt; 50%</b><br><span>最新报告期</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">✓</span><div><b>"没怎么涨"</b><br><span>我按近 6 个月涨幅 &lt; 10% 理解，可调整</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">✓</span><div><b>"大消费"</b><br><span>申万：食品饮料/家电/美护/商贸/社服</span></div></div></div>' +
              '已用 <b>PIT 时点库</b>（公告日口径，杜绝未来函数）。确认这样查吗？',
            chips: [{ t: '确认，查询', to: 'result' }, { t: '"没怎么涨"改成近一年', to: 'adjust' }]
          },
          adjust: {
            html: '已改为 <code>近 12 个月涨幅 &lt; 10%</code>，重新执行查询…',
            auto: 'result'
          },
          result: {
            html: '<b>命中 12 只</b>（共扫描 5,412 只）：',
            table: '<div class="tw" style="max-height:220px"><table class="dt"><thead><tr><th>代码</th><th>名称</th><th>3年ROE</th><th>负债率</th><th>12月涨幅</th><th>PE分位</th></tr></thead><tbody>' +
              '<tr><td>600519</td><td>贵州茅台</td><td class="up">31.2%</td><td>17%</td><td class="dn">-4.2%</td><td>22%</td></tr>' +
              '<tr><td>000858</td><td>五粮液</td><td class="up">24.6%</td><td>22%</td><td class="dn">-8.1%</td><td>14%</td></tr>' +
              '<tr><td>600887</td><td>伊利股份</td><td class="up">19.8%</td><td>41%</td><td>2.6%</td><td>31%</td></tr>' +
              '<tr><td>000333</td><td>美的集团</td><td class="up">22.4%</td><td>36%</td><td>7.8%</td><td>44%</td></tr>' +
              '<tr><td>603288</td><td>海天味业</td><td class="up">21.1%</td><td>24%</td><td class="dn">-11%</td><td>18%</td></tr>' +
              '<tr><td>…</td><td>还有 7 只</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>' +
              '</tbody></table></div>',
            chart: {
              k: 'hbar', height: 230, labelW: 72, diverge: false, sign: false, center: 25, scale: 3,
              items: ['贵州茅台', '五粮液', '海天味业', '美的集团', '伊利股份', '命中均值'],
              fv: function (v) { return v.toFixed(1) + '%'; },
              title: '命中公司 · 三年平均扣非 ROE'
            },
            verdict: ['wait', '提示：PE 历史分位均低于 50%，与"没怎么涨"条件一致；建议进一步看自由现金流与渠道库存。'],
            chips: [{ t: '每天自动跑一遍', to: 'task' }, { t: 'ROE 为什么用扣非？', to: 'why' }, { t: '导出 Excel', to: 'export' }]
          },
          why: {
            html: '扣非 ROE 剔除了政府补助、资产处置等一次性损益，更能反映主业真实回报。我在结果里同时保留了<b>摊薄 ROE</b> 对照，两者差异大的公司会打"收益质量"标签。',
            chips: [{ t: '每天自动跑一遍', to: 'task' }, { t: '导出 Excel', to: 'export' }]
          },
          task: {
            html: '已保存为定时任务 <code>消费质量选股-每日 18:00</code>：<div class="demo-cardgrid">' +
              '<div class="demo-kpi"><div class="k">频率</div><div class="v" style="font-size:12px">每交易日</div></div>' +
              '<div class="demo-kpi"><div class="k">新增提醒</div><div class="v" style="font-size:12px">新进/退出名单</div></div>' +
              '<div class="demo-kpi"><div class="k">扫描成本</div><div class="v" style="font-size:12px">≈0.2 元/次</div></div></div>' +
              '名单变化会在盘后推送到你的工作台，并自动对比上期差异。',
            verdict: ['go', '<b class="up">已创建</b>：可在「我的 AI 工作台 → 技能流」查看与管理。'],
            chips: [{ t: '再加个 ROE 跌破 15% 的预警', to: 'alert' }]
          },
          alert: {
            html: '已增加预警规则：<code>持仓股最新扣非 ROE(TTM) &lt; 15%</code>，命中时推送并自动附上同业对照与原因初判。',
            chips: [{ t: '导出 Excel', to: 'export' }]
          },
          export: {
            html: '已生成 <code>消费质量选股_20260910.xlsx</code>（示意），含三个工作表：结果清单、筛选口径、数据时点说明。真实环境中数字均可点击溯源到 PIT 快照。'
          }
        },
        routes: [
          { kw: ['每天', '定时', '任务'], to: 'task' },
          { kw: ['扣非', '为什么', '口径'], to: 'why' },
          { kw: ['导出', 'excel', 'Excel'], to: 'export' },
          { kw: ['预警', '跌破'], to: 'alert' }
        ]
      };
    }
  });

  F({
    id: 'DEM-02', m: 'demo', n: '样例：个股加仓决策', w: 6, tags: ['AI', '核心'],
    desc: '"宁德时代还能加仓吗"——五模块联动给出结论、仓位与反方观点。',
    spec: '演示 DEC 决策链：公司孪生健康度、投资论点健康、估值分位、最新信息与异常、预测到仓位五个模块串联，输出加仓/观察/回避三档结论、目标仓位推导与最强反方意见。',
    metrics: ['孪生健康', '论点健康', '估值分位', '建议仓位'],
    data: ['公司孪生', '论点库', '估值'], algo: ['仓位推导（示意）'], out: ['决策建议'],
    links: ['DEC-01', 'DEC-06', 'FUS-10'],
    subs: ['意图识别', '五模块串联', '三档结论', '仓位推导', '强制反方', '情景损失'],
    viz: function () {
      return {
        k: 'demo', scenario: 'DEC 决策链 · 个股加仓',
        placeholder: '输入：某只股票还能加仓吗？',
        start: 'q',
        nodes: {
          q: {
            html: '问一只股票要不要加减仓，给出你的约束（<b>点下面的问法直接看五模块联动分析</b>）：',
            chips: [
              { t: '宁德时代现在还能加仓吗？我能承受 10% 回撤，打算拿一年', to: 'clarify' },
              { t: '直接看结论与建议仓位', to: 'done' },
              { t: '为什么只加到 5.5% 仓位？', to: 'weight' },
              { t: '反对加仓的理由是什么？', to: 'bear' }
            ]
          },
          clarify: {
            html: '收到。你的约束：<b>持有期 12 个月 · 最大回撤预算 10%</b>。我将串联 5 个模块分析，约 10 秒：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">1</span><div><b>EQ-15 公司孪生</b> · 十九维健康度</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">2</span><div><b>DEC-04 论点健康</b> · 你的持有逻辑还成立吗</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">3</span><div><b>EQ-05 估值</b> · 六方法区间与历史分位</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">4</span><div><b>ANM-05 最新信息</b> · 财报/订单/资金面</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">5</span><div><b>DEC-06 预测→仓位</b> · 在你的约束下定权重</div></div></div>',
            auto: 'done'
          },
          done: {
            html: '<b>结论：可小幅加仓，但建议分两批，目标仓位 5.5%（当前 4.0%）</b>',
            kpis: [
              { k: '孪生健康分', v: '78/100', c: 'up' },
              { k: '论点健康', v: '82/100', c: 'up' },
              { k: 'PE 历史分位', v: '46%', c: '' },
              { k: '成功概率', v: '64%', c: '' },
              { k: '12M 预期收益', v: '+18%', c: 'up' },
              { k: '悲观情景', v: '-16%', c: 'dn' }
            ],
            steps: [
              ['经营面：景气仍在', '储能排产 Q3 环比 +12%，海外订单能见度到 Q1；毛利率 22.4% 环比 +0.6pct'],
              ['你的论点：成立但边际减弱', '"出货高增+盈利修复"仍有效，但价格竞争是新增风险项'],
              ['估值：不贵不便宜', '六方法区间 240-310 元，现价处区间中部，PE 分位 46%'],
              ['资金面：偏谨慎', '近 5 日北向净卖出 6.2 亿，两融余额下降']
            ],
            chart: {
              k: 'radar', height: 235,
              axes: ['成长', '盈利质量', '现金流', '护城河', '估值安全', '景气位置'],
              series: [
                { name: '宁德时代', data: [82, 76, 71, 88, 54, 79], color: '#f2495c' },
                { name: '行业均值', data: [58, 60, 57, 62, 50, 61], color: '#6b7791' }
              ]
            },
            verdict: ['wait', '建议动作：<b class="up">分两批加仓 +1.5pct</b>（今日加 0.8%，回调 5% 再加 0.7%）；单一仓位上限 8%，跌破 210 元或毛利率连续两季下滑则重新评估。'],
            chips: [{ t: '为什么是 5.5% 而不是 8%？', to: 'weight' }, { t: '最强的反对理由是什么？', to: 'bear' }, { t: '如果加完遇到财报暴雷呢？', to: 'stress' }, { t: '生成投委会提案', to: 'ic' }]
          },
          weight: {
            html: '仓位推导（Fractional Kelly + 风险预算）：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">1</span><div><b>概率赔率给出"裸"仓位 9.2%</b><br><span>成功 64%/+18%，失败 36%/-16%</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">2</span><div><b>1/4 Kelly 保守缩放 → 6.8%</b><br><span>预测不确定性折扣</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">3</span><div><b>10% 回撤预算约束 → 5.5%</b><br><span>该股对组合回撤的边际贡献已较高</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">4</span><div><b>流动性折扣已含</b><br><span>当前规模下无容量问题</span></div></div></div>' +
              '目标 5.5%，较当前 4.0% 加仓 1.5pct。',
            chips: [{ t: '最强的反对理由是什么？', to: 'bear' }, { t: '如果加完遇到财报暴雷呢？', to: 'stress' }]
          },
          bear: {
            html: '反方 Agent 找到三条最有力的反对证据：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">▼</span><div><b>价格战超预期</b><br><span>国内电池报价 8 月再降 4%，若延续，毛利率假设需下修 1.5-2pct</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">▼</span><div><b>海外政策风险</b><br><span>某国关税复审 10 月出结果，悲观情形影响出口利润约 8%</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">▼</span><div><b>筹码拥挤</b><br><span>公募超配比例处近 3 年 78% 分位，边际买盘减弱</span></div></div></div>' +
              '这也是建议<b>分批</b>而非一次加满的原因——把决策建立在证据更新上。',
            verdict: ['wait', '失效条件（写入论点监控）：单季毛利率 &lt; 20.5% 或海外收入同比转负 → 自动提醒减仓评估。'],
            chips: [{ t: '如果加完遇到财报暴雷呢？', to: 'stress' }, { t: '生成投委会提案', to: 'ic' }]
          },
          stress: {
            html: '财报三种情景下你的<b>组合</b>影响（不是单票）：<div class="demo-cardgrid">' +
              '<div class="demo-kpi"><div class="k">超预期(+12%/+31%)</div><div class="v up">组合 +0.9%</div></div>' +
              '<div class="demo-kpi"><div class="k">符合(-2%/+5%)</div><div class="v" style="font-size:13px">+0.1%</div></div>' +
              '<div class="demo-kpi"><div class="k">低于预期(-18%/-10%)</div><div class="v dn">-1.4%</div></div></div>' +
              '按目标仓位 5.5% 且悲观日组合预计 -1.4%，在你 10% 回撤预算内；已持有的黄金与利率债头寸在该情景历史相关性为负，提供部分对冲。',
            chart: {
              k: 'hbar', height: 195, labelW: 78, diverge: true, center: 0, scale: 1.1,
              items: ['乐观情景', '中性情景', '悲观情景', '尾部(5%)'],
              fv: function (v) { return (v > 0 ? '+' : '') + v.toFixed(1) + '%'; },
              title: '三种财报结果对组合的损益'
            },
            chips: [{ t: '生成投委会提案', to: 'ic' }, { t: '那就按分批方案执行', to: 'exec' }]
          },
          ic: {
            html: '已生成投委会提案包（DEC-08）：论点 3 条、证据链接 11 项、三情景、仓位推导、反方意见与失效条件。<b>风控/合规预检：通过</b>（单一仓位、行业偏离均在 IPS 内）。可直接提交周投委会电子投票。',
            chips: [{ t: '那就按分批方案执行', to: 'exec' }]
          },
          exec: {
            html: '第一批 +0.8% 已生成交易篮子（示意）：今日 VWAP 参与率 ≤8%，预计成本 6bp；第二批条件单：<code>较现价 -5% 触发，限价 -4.5%</code>。执行结果将进入决策日志并在到期自动记分。',
            verdict: ['go', '<b class="up">已进入执行队列</b> · 所有依据已冻结快照，复盘时可调出"当时为什么这么决定"。']
          }
        },
        routes: [
          { kw: ['为什么', '5.5', '仓位'], to: 'weight' },
          { kw: ['反对', '风险', '理由'], to: 'bear' },
          { kw: ['暴雷', '情景', '回撤'], to: 'stress' },
          { kw: ['投委会', '提案'], to: 'ic' },
          { kw: ['执行', '下单', '买入'], to: 'exec' }
        ]
      };
    }
  });

  F({
    id: 'DEM-03', m: 'demo', n: '样例：一句话搭建技能流', w: 6, tags: ['AI', '创新'],
    desc: '说出目标，AI 自动选功能、排流程，可边聊边改并试运行。',
    spec: '演示 WB-04：自然语言目标自动生成五步技能流（行业筛选→景气验证→组合优化→模拟跟踪→回撤提醒），展示节点自动连线、追问改参数、试运行结果与转定时任务。',
    metrics: ['意图拆解', '节点推荐', '自动连线', '试运行'],
    data: ['技能库'], algo: ['流程规划（示意）'], out: ['技能流'],
    links: ['WB-02', 'WB-04', 'FUS-18'],
    subs: ['一句话成流', '分步理由', '增量修改', '试运行', '定时触发', '保存分享'],
    viz: function () {
      return {
        k: 'demo', scenario: 'WB-04 · AI 对话搭建',
        placeholder: '描述你想自动化的研究流程…',
        start: 'q',
        nodes: {
          q: {
            html: '用一句话描述你的目标，我帮你搭成可定时运行的技能流（<b>点击看生成过程</b>）：',
            chips: [
              { t: '每周帮我找估值低且景气向上的行业，模拟跟踪组合，回撤超 10% 提醒我', to: 'plan' },
              { t: '回撤阈值改成 8% 可以吗？', to: 'edit' },
              { t: '先试运行 3 年看看', to: 'run' }
            ]
          },
          plan: {
            html: '已为你生成 <b>5 步技能流</b>，每个节点都是平台真实功能：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">1</span><div><b>IND-04 行业比较打分</b><br><span>条件：估值分位&lt;40% 且 景气动量&gt;0</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">2</span><div><b>IND-01 景气验证</b><br><span>高频指标二次确认，剔除假信号</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">3</span><div><b>FAC-08 组合优化</b><br><span>选中行业等权，单行业 ≤25%，写入模拟仓</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">4</span><div><b>REP-02 周度归因</b><br><span>每周五收盘后跟踪收益来源</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">5</span><div><b>PORT-04 回撤监控</b><br><span>回撤&gt;10% 推送企业微信+短信</span></div></div></div>',
            chips: [{ t: '为什么要第二步景气验证？', to: 'why' }, { t: '把回撤阈值改成 8%', to: 'edit' }, { t: '先试运行一次看看', to: 'run' }]
          },
          why: {
            html: '低估值可能持续很久（"价值陷阱"）。第二步用排产、价格、开工率等高频数据确认景气真的在改善，历史回测中这一步能把行业轮动信号的年化胜率从 52% 提高到 61%（示意数据）。',
            chips: [{ t: '把回撤阈值改成 8%', to: 'edit' }, { t: '先试运行一次看看', to: 'run' }]
          },
          edit: {
            html: '已修改：第 5 步阈值 <code>10% → 8%</code>；并补充规则——连续 3 日回撤扩大时提前预警（不等触发）。流程其余节点不变。',
            chips: [{ t: '先试运行一次看看', to: 'run' }, { t: '加个行业集中度限制', to: 'edit2' }]
          },
          edit2: {
            html: '已在第 3 步增加约束：<code>单一申万一级行业 ≤ 25%、前 3 大行业合计 ≤ 60%</code>。',
            chips: [{ t: '先试运行一次看看', to: 'run' }]
          },
          run: {
            html: '<b>试运行完成（用过去 3 年数据空跑）</b>：',
            kpis: [
              { k: '命中行业/周', v: '4.2 个', c: '' },
              { k: '年化超额', v: '+7.8%', c: 'up' },
              { k: '最大回撤', v: '-9.6%', c: '' },
              { k: '年换手', v: '2.4 次', c: '' },
              { k: '信号胜率', v: '61%', c: 'up' },
              { k: '当前命中', v: '银行/家电/水泥', c: '' }
            ],
            chart: {
              k: 'line', height: 210, n: 120, start: 1, vol: .007, drift: .0008,
              names: ['技能流模拟净值', '等权基准'], mean: 1, gap: .09, sd: .003,
              title: '3 年试运行净值（示意）'
            },
            verdict: ['wait', '注意：2024Q1 曾出现 -8.9% 回撤，距你的 8% 阈值很近，实际运行可能触发预警；是否接受这种敏感度？'],
            chips: [{ t: '接受，每周自动运行', to: 'save' }, { t: '那阈值改回 10%', to: 'edit' }]
          },
          save: {
            html: '技能流已保存并定时：<b>每周五 16:30</b> 自动运行，结果推送到工作台，回撤预警实时生效。<br>你可以在 <code>我的 AI 工作台 → 技能流</code> 随时暂停、克隆或分享给同事。',
            verdict: ['go', '<b class="up">自动化已开启</b> · 本周五将收到第一份行业轮动跟踪。']
          }
        },
        routes: [
          { kw: ['为什么', '验证'], to: 'why' },
          { kw: ['改成', '阈值', '8%'], to: 'edit' },
          { kw: ['试运行', '跑一下', '试试'], to: 'run' },
          { kw: ['保存', '自动', '每周'], to: 'save' }
        ]
      };
    }
  });

  F({
    id: 'DEM-04', m: 'demo', n: '样例：读文章找机会', w: 6, tags: ['AI', '创新'],
    desc: '粘贴一篇 AI 算力报道，AI 沿产业链映射资产并给出三档建议。',
    spec: '演示 WB-07 阅读即投资：文章→主题→产业链→资产→对照持仓与风险→不操作/观察/建仓三档结论，激进给个股、稳健给 ETF、保守给替代资产。',
    metrics: ['主题识别', '产业链展开', '持仓重复度', '三档建议'],
    data: ['文本', '主题图谱', '用户持仓'], algo: ['主题映射（示意）'], out: ['观察池/建议'],
    links: ['WB-07', 'TH-02', 'DEC-10'],
    subs: ['粘贴即解析', '产业链展开', '收入暴露', '画像匹配', '重复度检查', '三档结论'],
    viz: function () {
      return {
        k: 'demo', scenario: 'WB-07 · 阅读即投资',
        placeholder: '粘贴文章链接或一段文字…',
        start: 'q',
        nodes: {
          q: {
            html: '贴一段文章/研报/新闻，我解析主题并映射到标的与你的持仓（<b>点击看解析</b>）：',
            chips: [
              { t: '《AI 数据中心电力需求三年翻倍，电网设备与核电进入长周期景气》这跟投资有什么关系？', to: 'parse' },
              { t: '直接看受益产业链与收入暴露', to: 'chain' },
              { t: '我持有的和它重复吗？', to: 'held' },
              { t: '这个主题现在拥挤吗？', to: 'crowd' }
            ]
          },
          parse: {
            html: '已解析文章，识别主题与关键判断：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">T</span><div><b>主题：AI 算力→电力基础设施</b><br><span>置信度 88%（正文+标题双命中）</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">↑</span><div><b>核心判断</b><br><span>数据中心用电 3 年翻倍；电网投资、核电审批加速</span></div></div></div>' +
              '沿产业链展开受益环节（按收入暴露排序）：',
            auto: 'chain'
          },
          chain: {
            html: '<b>产业链映射</b>（数字为相关公司该主题收入暴露估算）：',
            table: '<div class="tw" style="max-height:200px"><table class="dt"><thead><tr><th>环节</th><th>逻辑</th><th>代表标的/ETF</th><th>收入暴露</th></tr></thead><tbody>' +
              '<tr><td>核电运营</td><td>基荷电力+审批加速</td><td>中国核电/中国广核</td><td>高</td></tr>' +
              '<tr><td>变压器/电网设备</td><td>输配电扩容</td><td>电力ETF(159611)</td><td>中高</td></tr>' +
              '<tr><td>液冷/温控</td><td>数据中心散热</td><td>相关主题 ETF</td><td>中</td></tr>' +
              '<tr><td>发电侧</td><td>用电需求拉动</td><td>公用事业 ETF</td><td>中</td></tr>' +
              '<tr><td>上游铜/铝</td><td>线材需求</td><td>有色 ETF</td><td>间接</td></tr>' +
              '</tbody></table></div>',
            chart: {
              k: 'sankey', height: 220,
              layers: [
                [{ n: 'AI 电力主题', v: 10 }],
                [{ n: '核电', v: 4 }, { n: '电网设备', v: 3 }, { n: '液冷温控', v: 2 }, { n: '上游金属', v: 1 }],
                [{ n: '个股', v: 4 }, { n: '行业 ETF', v: 5 }, { n: '观察池', v: 1 }]
              ],
              links: [[0, 0, 0, .9], [0, 0, 1, .6], [0, 0, 2, .5], [0, 0, 3, .3], [1, 0, 0, .8], [1, 1, 1, .8], [1, 2, 2, .6], [1, 3, 1, .4]]
            },
            chips: [{ t: '按我的情况该怎么做？', to: 'profile' }, { t: '我已经持有电力 ETF 了', to: 'held' }, { t: '这个主题拥挤吗？', to: 'crowd' }]
          },
          profile: {
            html: '按你的画像（<b>稳健型 · 3 年期限 · 回撤预算 12% · 当前权益仓位 58%</b>），我不直接推荐个股：',
            verdict: ['wait', '<b>建议：加入观察池，回调分批配置电力 ETF（不超过组合 6%）</b>。理由：逻辑中期成立但板块近 3 月已涨 21%，拥挤度 74% 分位，你的组合中成长风格已较高，适合用 ETF 控制个股风险。'],
            chips: [{ t: '如果是激进型会怎么配？', to: 'aggr' }, { t: '保守型呢？', to: 'cons' }, { t: '加入观察池并设提醒', to: 'watch' }]
          },
          aggr: {
            html: '激进型画像下：可关注核电运营龙头 + 液冷环节个股组合（4-6 只），主题总敞口 8-10%，止损 -12%；但个股波动显著更大，且液冷环节收入兑现尚早。',
            chips: [{ t: '保守型呢？', to: 'cons' }, { t: '加入观察池并设提醒', to: 'watch' }]
          },
          cons: {
            html: '保守型画像下：不建议直接追逐。可用<b>公用事业 ETF + 黄金</b>分享用电需求与避险，权益新增 ≤3%，其余通过债券 carry 获取收益。',
            chips: [{ t: '加入观察池并设提醒', to: 'watch' }]
          },
          held: {
            html: '你持有 <code>电力 ETF 4.2%</code>，与文章主题<b>高度重叠</b>。重复度检查：该 ETF 前 10 大成分与"电网设备+核电"主题重合 71%。<b>不建议在此基础上再追加同主题个股</b>，否则行业敞口将升至 9.8%，超过你 IPS 的 8% 上限。',
            chips: [{ t: '那我应该减吗？', to: 'profile' }, { t: '设置主题拥挤度提醒', to: 'watch' }]
          },
          crowd: {
            html: '当前主题拥挤度 <b>74% 分位</b>（成交占比、研报密度、公募超配三项合成），处于"趋势中后段"。历史上拥挤度 &gt;85% 后 3 个月平均回撤 -8%（示意统计）。这是建议观察而非立即重仓的核心原因。',
            chips: [{ t: '按我的情况该怎么做？', to: 'profile' }, { t: '加入观察池并设提醒', to: 'watch' }]
          },
          watch: {
            html: '已加入观察池：<b>AI 电力基础设施</b>。监控规则：①拥挤度回落至 60% 分位以下提醒加仓机会；②核电审批/电网招标重大事件推送；③相关 ETF 回调 8% 提醒。<br>这篇文章与阅读记录已归档到该主题，后续新信息会自动累积证据。',
            verdict: ['go', '<b class="up">已进入观察池</b> · 结论是"不操作/观察"——好的投顾系统懂得在不合适的时候建议不动。']
          }
        },
        routes: [
          { kw: ['我', '情况', '怎么'], to: 'profile' },
          { kw: ['持有', '已经'], to: 'held' },
          { kw: ['拥挤'], to: 'crowd' },
          { kw: ['激进'], to: 'aggr' },
          { kw: ['保守'], to: 'cons' },
          { kw: ['观察', '提醒'], to: 'watch' }
        ]
      };
    }
  });

})(window);
