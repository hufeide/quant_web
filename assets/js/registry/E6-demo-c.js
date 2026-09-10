/* registry/E6-demo-c.js — AI 实演中心（下）：
   多智能体辩论 / 晨会决策 / 突发事件 / 宏观数据 / 报告生成 / 技能市场 */
(function (g) {
  'use strict';
  var QW = g.QW, F = QW.F;

  F({
    id: 'DEM-11', m: 'demo', n: '样例：多智能体多空辩论', w: 6, tags: ['AI', '创新'],
    desc: '看 Bull/Bear/裁判三方 Agent 就同一标的辩论，最终给出加权结论。',
    spec: '演示 AGT-04：多方、空方、裁判智能体独立取证、交叉辩论，裁判评估证据强度后裁决，分歧过大时升级人工，展示 AI 如何对抗自身确认偏误。',
    metrics: ['多方证据', '空方证据', '裁判置信', '裁决结论'],
    data: ['研报/数据'], algo: ['多智能体辩论（示意）'], out: ['辩论结论'],
    links: ['AGT-04', 'AIP-06', 'WB-14'],
    subs: ['多方陈词', '空方陈词', '交叉质询', '证据评级', '裁判裁决', '人工升级'],
    viz: function () {
      return {
        k: 'demo', scenario: 'AGT-04 · Bull/Bear 辩论',
        placeholder: '输入一个有争议的标的…',
        start: 'q',
        nodes: {
          q: {
            html: '给一个观点，我让多方、空方、裁判三个智能体独立取证辩论（<b>点击开始</b>）：',
            chips: [
              { t: '让多空双方辩论一下：黄金现在还能不能追？', to: 'bull' },
              { t: '直接看裁判裁决', to: 'judge' },
              { t: '我要人工介入拍板', to: 'human' }
            ]
          },
          bull: {
            html: '🐂 <b>多方 Agent</b> 取证完成：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">+</span><div><b>实际利率下行</b><br><span>10Y TIPS 降至 0.4%，持有黄金机会成本下降</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">+</span><div><b>央行购金</b><br><span>全球央行连续 6 个季度净买入 &gt;200 吨</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">+</span><div><b>地缘避险</b><br><span>2 处冲突未缓和，尾部对冲需求高</span></div></div></div>',
            chips: [{ t: '空方怎么说？', to: 'bear' }]
          },
          bear: {
            html: '🐻 <b>空方 Agent</b> 取证完成：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">−</span><div><b>已涨很多</b><br><span>金价处历史 91% 分位，拥挤度 78%</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">−</span><div><b>降息已定价</b><br><span>市场隐含年内 3 次降息，预期差空间小</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">−</span><div><b>美元企稳</b><br><span>美元指数若反弹，黄金历史回撤均值 -6%</span></div></div></div>',
            chips: [{ t: '交叉质询', to: 'cross' }]
          },
          cross: {
            html: '<b>交叉质询（各找对方漏洞）</b>：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">⚔</span><div><b>空方打击多方</b><br><span>"央行购金"里含不可持续的一次性储备调整</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">⚔</span><div><b>多方反驳</b><br><span>即使降息预期修正，实际利率仍受财政赤字压制</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">⚔</span><div><b>共识</b><br><span>方向上不看空，分歧在"位置"与节奏</span></div></div></div>',
            chips: [{ t: '裁判裁决', to: 'judge' }]
          },
          judge: {
            html: '⚖️ <b>裁判 Agent</b> 对证据按强度与可验证性评级：',
            kpis: [
              { k: '多方证据强度', v: '0.68', c: 'up' },
              { k: '空方证据强度', v: '0.54', c: '' },
              { k: '共识方向', v: '偏多', c: 'up' },
              { k: '位置风险', v: '高', c: 'dn' }
            ],
            chart: {
              k: 'radar', height: 215,
              axes: ['利率逻辑', '央行购金', '避险需求', '估值安全', '拥挤度低', '降息空间'],
              series: [
                { name: '多方证据', data: [82, 76, 70, 42, 30, 58], color: '#f2495c' },
                { name: '空方证据', data: [55, 48, 40, 72, 22, 35], color: '#2fbf71' }
              ]
            },
            verdict: ['wait', '<b>裁决：不追高，回调分批配置</b>。目标敞口 8%（当前 6%），新增 2% 分两批：回调 4% 加 1%、8% 加 1%；拥挤度回落到 60% 分位以下可提前。止损不是价格，而是逻辑：实际利率转为持续上行或央行停止净购金。'],
            chips: [{ t: '分歧这么大要不要人工？', to: 'human' }, { t: '转成跟踪条件', to: 'track' }]
          },
          human: { html: '当前模型分歧度 0.41，低于升级阈值 0.6，<b>无需升级人工</b>；但因位置风险评级高，建议仅作为参考并由基金经理确认最终仓位。', chips: [{ t: '转成跟踪条件', to: 'track' }] },
          track: { html: '已写入论点监控（DEC-05）：<code>TIPS&gt;1.2%</code>、<code>央行净购金转负</code>、<code>拥挤度&gt;90%</code> 三个条件任一触发即推送。裁决与全部证据存入决策日志。', verdict: ['go', '<b class="up">辩论闭环完成</b> · 你看到的不是一个观点，而是观点的完整攻防过程。'] }
        },
        routes: [{ kw: ['空方', '熊'], to: 'bear' }, { kw: ['质询'], to: 'cross' }, { kw: ['裁判', '裁决'], to: 'judge' }, { kw: ['人工'], to: 'human' }, { kw: ['跟踪'], to: 'track' }]
      };
    }
  });

  F({
    id: 'DEM-12', m: 'demo', n: '样例：基金经理晨会', w: 6, tags: ['AI', '核心'],
    desc: '5 分钟晨会：隔夜变化、决策队列、风控预检一页过完。',
    spec: '演示 WB-11 决策台：AI 在开盘前汇总隔夜组合变化、事件与决策点，按价值排序给出今日待批事项，每个决策附依据、反方观点与合规预检结果。',
    metrics: ['隔夜变化', '待决策', '风控状态', '建议动作'],
    data: ['组合', '事件', '限额'], algo: ['决策聚合（示意）'], out: ['晨会简报'],
    links: ['WB-11', 'DEC-08', 'FUS-03'],
    subs: ['隔夜摘要', '决策队列', '批量审批', '合规预检', '反方观点', '语音简报'],
    viz: function () {
      return {
        k: 'demo', scenario: 'WB-11 · 晨会 5 分钟',
        placeholder: '生成本日晨会简报…',
        start: 'q',
        nodes: {
          q: {
            html: '开盘前 5 分钟，我把隔夜、事件与今日决策点整理好（<b>点击开始晨会</b>）：',
            chips: [
              { t: '开盘了，今天我需要做什么？', to: 'brief' },
              { t: '第一项决策的依据是什么？', to: 'why1' },
              { t: '有需要等数据才能定的吗？', to: 'wait' }
            ]
          },
          brief: {
            html: '<b>08:55 晨会简报（组合 3 号 · 规模 8.4 亿）</b><div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">夜</span><div><b>隔夜</b><br><span>纳指 +1.1%，10Y 美债 +4bp；组合预计净值 +0.3%</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">事</span><div><b>今日事件</b><br><span>① 持仓 A 10:00 经营数据 ② 议息纪要凌晨 ③ 2 只转债进入强赎计数</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">险</span><div><b>风控</b><br><span>电子行业敞口 29.6%（上限 30%），接近预警线</span></div></div></div>' +
              '<b>今日需要你决策 3 项：</b>',
            table: '<div class="tw"><table class="dt"><thead><tr><th>事项</th><th>AI 建议</th><th>置信度</th><th>合规</th><th>操作</th></tr></thead><tbody>' +
              '<tr><td>电子超限风险</td><td>减持某消费电子 1.2%</td><td>76%</td><td>通过</td><td>审批</td></tr>' +
              '<tr><td>转债 X 强赎</td><td>转股或卖出，勿等强赎</td><td>88%</td><td>通过</td><td>审批</td></tr>' +
              '<tr><td>黄金回调</td><td>按计划加 1%（分两批）</td><td>63%</td><td>通过</td><td>审批</td></tr>' +
              '</tbody></table></div>',
            chart: {
              k: 'timeline', height: 175,
              items: [
                { n: '09:30 开盘', d: '预计净值 +0.3%，无紧急动作', tag: '盘前', color: '#2fbf71' },
                { n: '10:00 经营数据', d: '持仓 A 发布，电子决策挂起', tag: '关键', color: '#f2495c' },
                { n: '凌晨 议息纪要', d: '利率债与黄金仓位敏感', tag: '海外', color: '#f2b53c' },
                { n: '14:55 转债处理', d: '2 只转债强赎，建议收盘前处理', tag: '到期', color: '#4d9fff' }
              ]
            },
            chips: [{ t: '第一个决策的依据？', to: 'why1' }, { t: '全部通过并生成篮子', to: 'approve' }, { t: '有反对意见吗？', to: 'bear' }]
          },
          why1: {
            html: '电子减持依据：①行业敞口 29.6% 距 30% 上限仅 0.4pct，该股占组合 4.8% 是最大边际来源；②近 5 日北向净卖出 6.2 亿；③DEC-05 论点健康分从 86 降到 74（价格竞争加剧）。<b>反方</b>：今晚经营数据可能超预期——所以建议减 1.2% 而非清仓。',
            chips: [{ t: '有反对意见吗？', to: 'bear' }, { t: '全部通过并生成篮子', to: 'approve' }]
          },
          bear: {
            html: '最强反对意见：<b>减持时点正逢经营数据公布前，历史上该股数据超预期概率 62%</b>。替代方案：等 10:00 数据出来后再决策，代价是若低开约 0.3% 冲击。我把两条路径的期望损益都列出，由你拍板。',
            chips: [{ t: '那就等数据出来再说', to: 'wait' }, { t: '还是先减半', to: 'half' }, { t: '全部通过并生成篮子', to: 'approve' }]
          },
          wait: { html: '已把该决策挂起并设 <b>10:05 提醒</b>（数据发布后 5 分钟，避开首波波动），届时自动附上数据解读与两种执行方案。', chips: [{ t: '其余两项通过', to: 'approve2' }] },
          half: { html: '折中方案：先减 0.6% 使敞口回到 29.0%，剩余视数据决定。已生成对应篮子。', chips: [{ t: '其余两项通过', to: 'approve2' }] },
          approve: { html: '3 项全部通过（电子减持需要你二次确认，已勾选）。已生成 12 笔交易篮子：算法按流动性推荐 VWAP/POV，预计总成本 7.2bp，<b>风控复核与合规留痕自动完成</b>。', verdict: ['go', '<b class="up">已提交执行台</b> · 决策依据快照冻结，盘后 TCA 与决策记分自动回填。'] },
          approve2: { html: '转债处理与黄金加仓 2 项已通过并生成篮子；电子项挂起等数据。盘后将推送执行结果与晨会决策命中率。', verdict: ['go', '<b class="up">晨会完成，用时 4 分 40 秒</b>'] }
        },
        routes: [{ kw: ['依据', '为什么'], to: 'why1' }, { kw: ['反对'], to: 'bear' }, { kw: ['等'], to: 'wait' }, { kw: ['一半'], to: 'half' }, { kw: ['通过', '篮子'], to: 'approve' }]
      };
    }
  });

  F({
    id: 'DEM-13', m: 'demo', n: '样例：突发事件 10 分钟反应', w: 6, tags: ['AI'],
    desc: '出口管制突发：事件→产业链→持仓影响→应对的快速反应链。',
    spec: '演示 EQ-17/AI-04：突发政策事件后 AI 自动识别影响面、沿产业链映射到持仓、给出影响程度与可选交易结构，10 分钟内形成可决策材料。',
    metrics: ['影响标的', '持仓敞口', '影响幅度', '应对结构'],
    data: ['事件流', '产业链', '持仓'], algo: ['事件映射（示意）'], out: ['事件速评'],
    links: ['EQ-17', 'IND-10', 'ANM-05'],
    subs: ['事件抽取', '影响谁', '影响多大', '是否已定价', '持仓传导', '交易结构'],
    viz: function () {
      return {
        k: 'demo', scenario: 'EQ-17 · 突发事件反应',
        placeholder: '突发：某国升级 AI 芯片出口管制…',
        start: 'push',
        nodes: {
          push: {
            html: '🚨 <b>09:42 突发推送</b>：某国宣布扩大对华 AI 芯片出口管制范围，新增两类高性能 GPU 许可要求。AI 事件引擎已启动：',
            auto: 'map'
          },
          map: {
            html: '<b>① 影响谁（产业链映射，置信度 82%）</b><div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">▼</span><div><b>直接受损</b><br><span>依赖进口高端 GPU 的算力租赁、部分云厂商</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">▲</span><div><b>潜在受益</b><br><span>国产 GPU、先进封装、液冷、替代芯片产业链</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">○</span><div><b>中性</b><br><span>应用层软件（需求逻辑不受供给政策直接影响）</span></div></div></div>',
            chart: {
              k: 'hbar', height: 205, labelW: 86, diverge: true, center: 0, scale: 2.4,
              items: ['国产GPU', '先进封装', '液冷', '应用层', '云厂商', '算力租赁'],
              fv: function (v) { return (v > 0 ? '+' : '') + v.toFixed(1) + '%' },
              title: '事件后各板块盘前反应'
            },
            chips: [{ t: '我的组合受影响吗？', to: 'port' }, { t: '市场定价了吗？', to: 'price' }]
          },
          port: {
            html: '<b>② 你的组合传导</b>',
            kpis: [
              { k: '直接受损敞口', v: '3.8%', c: 'dn' },
              { k: '间接受益敞口', v: '2.1%', c: 'up' },
              { k: '净敞口', v: '-1.7%', c: 'dn' },
              { k: '情景单日损失', v: '-0.6%', c: '' }
            ],
            steps: [
              ['受损明细', '算力租赁 ETF 2.6% + 某云厂商 1.2%；期货盘已反应 -2.3%'],
              ['受益明细', '国产替代主题基金 1.4% + 先进封装 0.7%']
            ],
            chips: [{ t: '我该怎么做？', to: 'action' }, { t: '市场定价了吗？', to: 'price' }]
          },
          price: {
            html: '<b>③ 市场是否已定价</b>：港股相关标的期货盘平均 -3.1%，但 A 股国产替代板块盘前竞价 +2.8%——<b>方向已部分定价、幅度未定价</b>。参考 2022 年同类事件，直接受损板块 5 日累计 -7%，受益主题 +9%（示意）。',
            chips: [{ t: '我该怎么做？', to: 'action' }]
          },
          action: {
            html: '<b>④ 应对选项（附风险）</b><div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">A</span><div><b>受损敞口减半（-1.9%）</b><br><span>开盘分两笔，避免冲击；保留仓位防政策松绑反复</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">B</span><div><b>不追高受益板块</b><br><span>盘前已涨，等回踩或用事件后漂移参与</span></div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">C</span><div><b>尾部保护</b><br><span>若担忧升级，用指数看跌期权对冲净敞口，成本约 0.2%</span></div></div></div>',
            verdict: ['wait', '建议 A+C 组合：预计把单日情景损失从 -0.6% 收窄到 -0.2%，成本约 0.25%。等待你的确认——突发事件<b>不自动下单</b>。'],
            chips: [{ t: '执行 A+C', to: 'exec' }, { t: '持续跟踪这个事件', to: 'track' }]
          },
          exec: { html: '已生成交易篮子与对冲指令（示意），风控预检通过（净敞口回到限额内）。', verdict: ['go', '<b class="up">09:51 完成决策材料</b> · 从突发到可执行方案用时 9 分钟。'] },
          track: { html: '已创建事件跟踪组：后续许可证细则、公司公告、国产替代订单自动汇入，每日 17:00 更新影响评估，直到事件影响衰减（热度 &lt;20% 分位）自动归档。' }
        },
        routes: [{ kw: ['组合', '影响我'], to: 'port' }, { kw: ['定价'], to: 'price' }, { kw: ['怎么做', '应对'], to: 'action' }, { kw: ['执行'], to: 'exec' }, { kw: ['跟踪'], to: 'track' }]
      };
    }
  });

  F({
    id: 'DEM-14', m: 'demo', n: '样例：CPI 发布日的 AI 解读', w: 6, tags: ['AI'],
    desc: '数据发布前预期、发布后预期差与资产映射，一分钟讲清楚。',
    spec: '演示 MAC-11/13：发布前给市场预期与历史效应，发布后即时计算预期差、对照各资产反应，并更新宏观预测账本与组合含义。',
    metrics: ['一致预期', '实际值', '预期差', '资产映射'],
    data: ['宏观数据', '资产行情'], algo: ['预期差分析（示意）'], out: ['数据快评'],
    links: ['MAC-11', 'MAC-13', 'DEC-11'],
    subs: ['发布前预期', '历史效应', '即时解读', '资产联动', '预测结算', '组合含义'],
    viz: function () {
      return {
        k: 'demo', scenario: 'MAC-11 · 宏观数据日',
        placeholder: '09:30 CPI 发布…',
        start: 'before',
        nodes: {
          before: {
            html: '⏰ <b>09:15 发布前</b>（09:30 公布 8 月 CPI）：<div class="demo-cardgrid">' +
              '<div class="demo-kpi"><div class="k">一致预期 同比</div><div class="v">0.7%</div></div>' +
              '<div class="demo-kpi"><div class="k">AI Nowcast</div><div class="v warn" style="color:var(--warn)">0.5%</div></div>' +
              '<div class="demo-kpi"><div class="k">前值</div><div class="v">0.6%</div></div>' +
              '<div class="demo-kpi"><div class="k">市场隐含</div><div class="v" style="font-size:12px">偏鸽交易</div></div></div>' +
              '我的模型比卖方共识低 0.2pct——如果兑现，属于<b>正预期差（利多债）</b>。历史上 CPI 低于预期 0.2pct 时，10Y 国债平均下行 3bp。',
            chips: [{ t: '数据出来了：实际 0.5%', to: 'after' }]
          },
          after: {
            html: '✅ <b>09:30 实际 0.5%</b>，与我的 Nowcast 完全一致，<b>低于卖方共识 0.2pct</b>：',
            kpis: [
              { k: '预期差', v: '-0.2%', c: 'up' },
              { k: '10Y 国债', v: '-3.5bp', c: 'up' },
              { k: '利率债指数', v: '+0.28%', c: 'up' },
              { k: '成长风格', v: '+0.9%', c: 'up' }
            ],
            steps: [
              ['为什么利好成长', '通胀温和→宽松空间打开→久期与成长估值受益'],
              ['需要警惕', '核心 CPI 仍持平，PPI 未转正，总需求修复仍慢']
            ],
            chart: {
              k: 'line', height: 200, n: 24, monthly: true, mode: 'ou',
              names: ['AI Nowcast', '卖方一致预期', '实际值'],
              mean: .7, gap: .12, sd: .12,
              fy: function (v) { return v.toFixed(1) + '%'; },
              title: 'CPI 同比：预测 vs 实际（近 24 月）'
            },
            chips: [{ t: '对我的组合什么意思？', to: 'port' }, { t: '预测模型表现如何？', to: 'score' }]
          },
          port: {
            html: '<b>组合含义</b>：你的久期 4.2 年，利率下行 3.5bp 贡献约 +0.15%；成长风格敞口 31%，贡献约 +0.3%。<b>不建议追涨</b>——单日行情已兑现预期差，下一个验证点是下周社融；利率债维持当前久期，若社融也低于预期再考虑加久期。',
            chips: [{ t: '预测模型表现如何？', to: 'score' }]
          },
          score: {
            html: '<b>预测账本结算（DEC-11）</b>：本次 AI Nowcast 误差 0.0pct，卖方共识误差 0.2pct。该模型 CPI 预测近 12 次<b>命中 9 次</b>，权重已自动上调 2%；宏观研究 Agent 的解释质量记一次正分。',
            verdict: ['go', '<b class="up">闭环</b>：预测→实际→结算→调整下一次模型权重，预测能力随时间积累。']
          }
        },
        routes: [{ kw: ['实际', '出来', '0.5'], to: 'after' }, { kw: ['组合'], to: 'port' }, { kw: ['模型', '表现'], to: 'score' }]
      };
    }
  });

  F({
    id: 'DEM-15', m: 'demo', n: '样例：一键生成研究报告', w: 6, tags: ['AI'],
    desc: '从研究数据到十段式图文报告，再到观点持续监控。',
    spec: '演示 AI-02/WB-15：AI 汇编研究材料、自动配图表、做事实核对与合规审查生成初稿，并把核心结论转为持续监控的论点。',
    metrics: ['生成章节', '图表', '事实核对', '监控指标'],
    data: ['研究库'], algo: ['模板生成（示意）'], out: ['研究报告'],
    links: ['AI-02', 'WB-15', 'DEC-05'],
    subs: ['材料汇编', '自动配图', '事实核对', '反方章节', '合规审查', '转监控'],
    viz: function () {
      return {
        k: 'demo', scenario: 'AI-02 · 研究报告生成',
        placeholder: '把关于储能行业的研究整理成报告…',
        start: 'q',
        nodes: {
          q: {
            html: '指定范围，我把研究材料汇编成带图表的报告（<b>点击生成</b>）：',
            chips: [
              { t: '把这周关于储能行业的调研、数据和模型结果整理成一份深度报告', to: 'gen' },
              { t: '直接看质检与自动配图结果', to: 'check' },
              { t: '核心结论是什么？', to: 'summary' },
              { t: '发布并持续跟踪', to: 'publish' }
            ]
          },
          gen: {
            html: '正在汇编 6 份研报、2 次调研纪要、排产/招标数据与你的模型结果…<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">1</span><div><b>投资摘要</b> · 自动生成并锁定 3 个核心结论</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">2</span><div><b>行业/公司/财务/估值</b> · 数据回填</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">3</span><div><b>自动配 9 张图表</b> · 排产趋势、招标价格、估值对比…</div></div></div>',
            auto: 'check'
          },
          check: {
            html: '<b>质检完成</b>：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">✓</span><div><b>事实核对</b>：126 个数字全部可溯源，2 处口径不一致已标黄待确认</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">✓</span><div><b>反方章节已写入</b>：价格战、海外政策、产能过剩三条风险</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">✓</span><div><b>合规审查</b>：无禁用表述，风险提示完整</div></div></div>' +
              '报告 22 页，预计阅读 15 分钟。',
            chart: {
              k: 'bar', height: 185, center: 6, scale: 3, sign: false,
              cats: ['摘要', '行业', '公司', '财务', '估值', '催化', '风险', '跟踪'],
              series: [{ name: '自动配图数', data: [1, 3, 2, 4, 3, 1, 2, 1], color: '#22c1c3' }]
            },
            chips: [{ t: '核心结论是什么？', to: 'summary' }, { t: '发布并跟踪', to: 'publish' }]
          },
          summary: {
            html: '<b>三个核心结论</b>：①大储招标价格 Q3 企稳，龙头单位盈利环比修复；②新兴市场需求对冲国内增速放缓；③板块估值处 34% 分位，龙头具备 25% 空间但二三线仍贵。<br><b>目标组合建议</b>：龙头 2 只等权、行业敞口 ≤6%、持有 2-3 个季度。',
            chips: [{ t: '发布并跟踪', to: 'publish' }]
          },
          publish: {
            html: '报告已发布，核心结论<b>自动转为 3 条论点监控</b>：<code>招标均价连续 2 月回升</code>、<code>龙头单瓦盈利环比为正</code>、<code>新兴市场收入占比提升</code>；任一被新数据证伪即通知你重估。',
            verdict: ['go', '<b class="up">研究不是一次性文档</b> · 它变成了每天被检验的活观点。']
          }
        },
        routes: [{ kw: ['结论'], to: 'summary' }, { kw: ['发布', '跟踪'], to: 'publish' }]
      };
    }
  });

  F({
    id: 'DEM-16', m: 'demo', n: '样例：从场景到技能市场', w: 12, tags: ['AI', '创新'],
    desc: '一次满意的对话如何沉淀为团队共享、定时运行的自动化技能。',
    spec: '演示 FUS-18/19：场景运行结果可保存为技能流、设置触发方式、发布到团队模板市场，被他人复用并形成评分；展示"对话→自动化→组织资产"的完整闭环。',
    metrics: ['保存流程', '触发设置', '团队复用', '评分'],
    data: ['技能流', '模板市场'], algo: ['无（流程演示）'], out: ['团队技能模板'],
    links: ['WB-02', 'FUS-19', 'KNO-11'],
    subs: ['保存技能', '触发方式', '权限设置', '发布市场', '复用次数', '评分迭代'],
    viz: function () {
      return {
        k: 'demo', scenario: 'FUS-19 · 场景→技能资产',
        placeholder: '把刚才的分析变成每天自动运行的技能…',
        start: 'q',
        nodes: {
          q: {
            html: '一次满意的对话可以沉淀成团队共享的自动化技能（<b>点击看沉淀过程</b>）：',
            chips: [
              { t: '刚才"低估值+景气向上行业轮动"这个分析很好，能让它每周自动跑、组里也能用吗？', to: 'save' },
              { t: '设置每周五 16:30 自动运行', to: 'sched' },
              { t: '发布到团队模板市场', to: 'market' }
            ]
          },
          save: {
            html: '已把对话中的 5 个步骤提取为技能流：<div class="demo-steps">' +
              '<div class="demo-step"><span class="demo-stepdot">1</span><div><b>IND-04</b> 估值分位&lt;40% × 景气动量&gt;0</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">2</span><div><b>IND-01</b> 高频景气二次确认</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">3</span><div><b>FAC-08</b> 等权组合（单行业≤25%）</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">4</span><div><b>REP-02</b> 周度归因</div></div>' +
              '<div class="demo-step"><span class="demo-stepdot">5</span><div><b>PORT-04</b> 回撤&gt;8% 预警</div></div></div>',
            chips: [{ t: '设置每周五自动运行', to: 'sched' }, { t: '发布到团队模板市场', to: 'market' }]
          },
          sched: {
            html: '触发设置完成：<div class="demo-cardgrid">' +
              '<div class="demo-kpi"><div class="k">运行时间</div><div class="v" style="font-size:12px">每周五 16:30</div></div>' +
              '<div class="demo-kpi"><div class="k">推送</b></div><div class="v" style="font-size:12px">企业微信+邮件</div></div>' +
              '<div class="demo-kpi"><div class="k">预警</div><div class="v" style="font-size:12px">回撤实时</div></div>' +
              '<div class="demo-kpi"><div class="k">首次运行</div><div class="v" style="font-size:12px">本周五</div></div></div>',
            chips: [{ t: '发布到团队模板市场', to: 'market' }]
          },
          market: {
            html: '已发布到团队技能市场 <b>「估值景气行业轮动-周频 v1」</b>，其他成员可一键克隆：',
            table: '<div class="tw"><table class="dt"><thead><tr><th>指标</th><th>值</th><th>说明</th></tr></thead><tbody>' +
              '<tr><td>可见范围</td><td>投研一部</td><td>组内可见，其他部门需申请</td></tr>' +
              '<tr><td>当前订阅</td><td>7 人</td><td>发布 2 周</td></tr>' +
              '<tr><td>平均评分</td><td>4.6 / 5</td><td>"信号比自己筛的早 1-2 周"</td></tr>' +
              '<tr><td>试运行超额</td><td class="up">+7.8% 年化</td><td>3 年回测（示意）</td></tr>' +
              '<tr><td>贡献积分</td><td>+120</td><td>计入你的研究资产积分</td></tr>' +
              '</tbody></table></div>',
            chart: {
              k: 'stack', height: 200, cats: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'],
              series: [
                { name: '直接订阅', data: [1, 3, 4, 5, 5, 6, 6, 7], color: '#4d9fff' },
                { name: '克隆改造', data: [0, 1, 2, 3, 4, 5, 6, 7], color: '#22c1c3' },
                { name: '定时运行', data: [1, 4, 6, 8, 9, 11, 12, 14], color: '#8b7cf6' }
              ]
            },
            verdict: ['go', '<b class="up">一次对话变成了组织资产</b>：它每周自动运行、被 7 人复用、持续积累评分——平台越用越聪明。']
          }
        },
        routes: [{ kw: ['每周', '定时', '触发'], to: 'sched' }, { kw: ['市场', '团队', '发布'], to: 'market' }]
      };
    }
  });

})(window);
